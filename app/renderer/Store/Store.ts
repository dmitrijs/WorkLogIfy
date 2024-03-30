import moment from "moment";
import {reactive} from "vue";
import {timespanToText} from '../Utils/Utils';
import Store_GetGroupedTasks from "./Store_GetGroupedTasks";
import {cloneDeep, keyBy} from "lodash";

function saveTasks() {
    window.ipc.sendSync('tasks.save', {
        day_key: state.day_key,
        arg1: cloneDeep(state.tasks),
        arg2: cloneDeep(store.getTasksGrouped),
        arg3: cloneDeep(state.settings),
    });
}

function saveActiveApps() {
    window.ipc.sendSync('activeApps.save', {
        day_key: state.day_key,
        activeApps: cloneDeep(state.activeApps),
    });
}

function saveTaskTemplates() {
    window.ipc.sendSync('tasks.templates.save', cloneDeep(state.templates));
}

function addSession(task_id: string, spentSeconds: number, method: string, idleSeconds = 0) {
    store.state.tasks[task_id].sessions.push({
        started_at: moment().subtract(spentSeconds, 'seconds').toISOString(),
        finished_at: moment().subtract(idleSeconds, 'seconds').toISOString(),
        spent_seconds: (spentSeconds - idleSeconds),
        method: method,
    })
}

function addActiveApp(task_id: string, activeAppDescription: string, secondsIdle: number) {
    let activeApps = state.tasks[task_id].activeApps;
    activeApps.push({
        noticed_at: moment().toISOString(),
        seconds_idle: secondsIdle,
        description: activeAppDescription,
    });
    state.tasks[task_id].activeApps = activeApps;
}

function addRecord(task_id:string, recordedSeconds: number, method: string, jiraWorkLogId = null) {
    let records = state.tasks[task_id].records;
    let record = {
        created_at: moment().toISOString(),
        recorded_seconds: recordedSeconds,
        method: method,
    };
    if (jiraWorkLogId) {
        record['jiraWorkLogId'] = jiraWorkLogId;
    }
    records.push(record);
    state.tasks[task_id].records = records;
}

const state = reactive({
    tasks: {} as Record<string, TaskObj>,

    activeApps: [] as ActiveAppObj[],

    tasksSelectedIds: {} as Record<string, boolean>,
    taskLastSelected: '',
    taskIsExtracting: false, // new task that is created is extracted from the selected task
    tasksHoveredId: null,
    taskEditedId: null,
    tasksScreen: 'tasks',
    taskTimeredId: null,
    tasksShowAsReport: false,
    tasksHideUnReportable: false,
    timerElapsedText: null,
    timerElapsed: 0,
    screen: null,
    is_debug: false,
    day_key: '',
    week_key: '',
    allFiles: [],
    fileTotals: {},
    templates: [],
    createdTaskId: '',
    taskInClipboard: null as TaskObj,
    taskIsCloned: false,
    calendarHoveredDayCode: null,

    asanaTasks: {} as Record<string, AsanaTaskObj>,

    settings: {} as SettingsObj,
});
state.screen = state.tasksScreen;

function updateTaskField(tasks: any, task_id: any, field: any, value: any) {
    console.log(tasks[task_id]);
    tasks[task_id][field] = value;
    if (value === true) {
        tasks[task_id][field + '_at'] = moment().toISOString();
    } else if (value === false) {
        delete tasks[task_id][field + '_at'];
    }
    return tasks;
}

const store = {
    state,

    get getTasksGrouped(): Record<string, any> {
        return Store_GetGroupedTasks();
    },

    get getTasksUi() {
        return {
            selectedIds: state.tasksSelectedIds,
            hoveredId: state.tasksHoveredId,
            editedId: state.taskEditedId,
            timeredId: state.taskTimeredId,
            timerElapsedText: state.timerElapsedText,
            screen: state.screen,
            is_debug: state.is_debug,
            day_key: state.day_key,
            tasksShowAsReport: state.tasksShowAsReport,
            tasksHideUnReportable: state.tasksHideUnReportable,
            taskInClipboard: state.taskInClipboard,
        }
    },

    get getEditedTask(): TaskEditedObj {
        console.log('getEditedTask', state.taskEditedId);
        return <TaskEditedObj>state.tasks[state.taskEditedId];
    },

    get getEmptyTask(): TaskEditedObj {
        let task = {
            code: '',
            title: '',
            frozen: false,
            time_spent_seconds: 0,
            date: state.day_key,
            time_add_minutes: '',
            time_record_minutes: '',
            asanaTaskGid: '',
        } as TaskEditedObj;

        let refTask = null;
        if (state.taskLastSelected && (refTask = state.tasks[state.taskLastSelected])) {
            task.date = refTask.date;
            task.code = refTask.code;

            if (state.taskIsExtracting) {
                state.taskIsExtracting = false;
                task.taskIdExtractedFrom = state.taskLastSelected;
            }
        }
        state.taskLastSelected = '';

        return task;
    },

    get getFileTotals() {
        return state.fileTotals;
    },

    get getTaskTemplates() {
        return state.templates;
    },

    tasksUiHoveredId(id: string) {
        state.tasksHoveredId = id;
    },
    tasksUiToggle(id: string) {
        console.log(id);
        if (state.tasksSelectedIds[id]) {
            delete state.tasksSelectedIds[id];
        } else {
            state.tasksSelectedIds[id] = true;
        }
    },
    createTask(task) {
        const id = 'task_' + moment.utc();
        state.tasks[id] = {
            id: id,
            code: task.code,
            title: task.title,
            distributed: false,
            chargeable: true,
            frozen: !!task.frozen,
            notes: task.notes,
            comment: task.comment,
            source: task.source,
            date: task.date,
            created_at: moment().toISOString(),
            sessions: [],
            records: [],
            activeApps: [],
            asanaTaskGid: task.asanaTaskGid,
        };
        state.createdTaskId = id;

        if (task.time_add_minutes) {
            let spentSeconds = parseInt(task.time_add_minutes) * 60 || 0;

            if (task.taskIdExtractedFrom) {
                addSession(id, spentSeconds, 'extracted');
                addSession(task.taskIdExtractedFrom, -spentSeconds, 'extracted');
            } else {
                addSession(id, spentSeconds, 'manual');
            }
        }
        if (task.time_add_idle_seconds) {
            let seconds = parseInt(task.time_add_idle_seconds) || 0;
            addSession(id, seconds, 'idle');
        }

        console.log(state.tasks);

        state.screen = state.tasksScreen;

        saveTasks();
    },
    saveTask(task: TaskEditedObj) {
        console.log('save', task);

        state.tasks[task.id].code = task.code;
        state.tasks[task.id].title = task.title;
        state.tasks[task.id].date = task.date;
        state.tasks[task.id].frozen = !!task.frozen;
        state.tasks[task.id].notes = task.notes;
        state.tasks[task.id].comment = task.comment;
        state.tasks[task.id].source = task.source;
        state.tasks[task.id].asanaTaskGid = task.asanaTaskGid;

        if (task.time_add_minutes) {
            let spentSeconds = parseInt(task.time_add_minutes) * 60 || 0;

            addSession(task.id, spentSeconds, 'manual');
        }
        if (task.time_record_minutes) {
            let recordSeconds = parseInt(task.time_record_minutes) * 60 || 0;

            addRecord(task.id, recordSeconds, 'manual');
        }

        state.taskEditedId = null;
        state.screen = state.tasksScreen;

        console.log(state.tasks);
        saveTasks();
    },
    updateTask([task_id, field, value]) {
        state.tasks = updateTaskField(state.tasks, task_id, field, value);
        if ((field === 'chargeable' && !value) || (field === 'distributed' && value)) {
            state.tasks = updateTaskField(state.tasks, task_id, 'is_done', true);
        }
        saveTasks();
    },
    taskAddRecordedSeconds([task_id, recordSeconds, jiraWorkLogId]) {
        addRecord(task_id, recordSeconds, 'quick', jiraWorkLogId);

        saveTasks();
    },
    setScreen(screen) {
        state.screen = screen;
        if (screen === 'tasks') {
            state.tasksScreen = screen;
        }
    },
    returnToTasksScreen() {
        state.screen = state.tasksScreen;
    },
    toggleDebug(value) {
        state.is_debug = value;
    },
    toggleTasksShowAsReport() {
        state.tasksShowAsReport = !state.tasksShowAsReport;
    },
    toggleHideUnReportable() {
        state.tasksHideUnReportable = !state.tasksHideUnReportable;
    },
    taskEdit(key) {
        state.taskEditedId = key;
        state.screen = 'task.edit';
    },
    setDay(day: string) {
        if (state.taskTimeredId) {
            alert('Cannot change date if some task is active.');
            return;
        }
        state.day_key = day;
        state.week_key = moment(day, "YYYY-MM-DD").endOf('isoWeek').format('YYYY-WW');
        let workday = window.ipc.sendSync('tasks.load', state.day_key);

        state.tasks = workday.tasks; //convertJsTasksToMap(workday.tasks);
        state.activeApps = workday.activeApps;
        if (!state.activeApps) {
            state.activeApps = [];
        }
    },
    setDayFromJson(tasksJson: string) {
        if (state.taskTimeredId) {
            alert('Cannot import if some task is active.');
            return;
        }
        let added = 0, replaced = 0;
        let tasks = null;
        try {
            tasks = JSON.parse(tasksJson);
        } catch (ex) {
        }
        if (!tasks || !Object.keys(tasks).length || !Object.keys(tasks)[0].match(/^task_\d+$/)) {
            alert(`ERROR: Invalid clipboard contents:\n\n${tasksJson}`);
            return;
        }
        for (let taskId of Object.keys(tasks)) {
            if (state.tasks[taskId]) {
                replaced++;
            } else {
                added++;
            }
            state.tasks[taskId] = tasks[taskId];
        }
        saveTasks();
        if (replaced + added > 0) {
            alert(`${added} task(s) added, ${replaced} existing task(s) replaced`);
        }
    },
    loadSettings() {
        state.settings = window.ipc.sendSync('settings.load');
    },
    updateSettings(settings) {
        state.settings = {...settings};
        saveTasks();
    },
    openNextDay() {
        let today = moment(state.day_key, 'YYYY-MM-DD');
        let tomorrow = today.add(1, 'day').format('YYYY-MM-DD');
        this.commit('setDay', tomorrow);
    },
    selectHovered() {
        if (!state.tasksHoveredId) {
            return;
        }
        state.taskLastSelected = state.tasksHoveredId;
        state.tasksSelectedIds[state.tasksHoveredId] = true;
    },
    deselectAll() {
        state.tasksSelectedIds = {};
    },
    clipboardCopy(taskId) {
        state.taskInClipboard = state.tasks[taskId];
        state.taskIsCloned = true;
    },
    clipboardCut(taskId) {
        state.taskInClipboard = state.tasks[taskId];
        state.taskIsCloned = false;

        delete state.tasks[taskId];

        saveTasks();
    },
    clipboardPaste() {
        if (!state.taskInClipboard) {
            return;
        }

        const id = 'task_' + moment.utc();
        let newTask = {...state.taskInClipboard, id: id};

        if (state.taskIsCloned) {
            newTask.sessions = [];
            newTask.records = [];
            newTask.activeApps = [];
        }

        state.tasks[id] = newTask;

        saveTasks();
    },
    activateTimer(taskId: string) {
        if (taskId === null) {
            taskId = state.tasksHoveredId;
        }
        state.taskTimeredId = taskId;
        state.tasksSelectedIds = {};

        state.tasks = updateTaskField(state.tasks, taskId, 'is_on_hold', false);
        saveTasks();
    },
    activeTimer(secondsElapsed) {
        state.timerElapsedText = '+' + timespanToText(secondsElapsed, '+');
        state.timerElapsed = secondsElapsed;
    },
    setFileTotals(fileTotals) {
        state.fileTotals = fileTotals;
    },
    setTaskTemplates(templates) {
        state.templates = templates;
    },
    stopTimer([secondsElapsed, secondsIdle]) {
        console.log('secondsElapsed', secondsElapsed, 'secondsIdle', secondsIdle);

        addSession(state.taskTimeredId, secondsElapsed, 'timer', secondsIdle);

        state.tasksSelectedIds = {};
        state.timerElapsedText = '';
        state.timerElapsed = 0;
        state.taskTimeredId = null;

        saveTasks();
    },
    taskAddSession([taskId, minutes, method]) {
        addSession(taskId, minutes * 60, method);
        saveTasks();
    },
    taskAddActiveApp([taskId, activeAppDescription, secondsIdle]) {
        addActiveApp(taskId, activeAppDescription, secondsIdle);
        saveTasks();
    },
    addGlobalActiveApp(timeredTaskId: string, activeAppDescription: string, secondsIdle: number) {
        state.activeApps.push({
            noticed_at: moment().toISOString(),
            seconds_idle: secondsIdle,
            timered_task: timeredTaskId,
            description: activeAppDescription,
        });
        saveActiveApps();
    },
    templateNew() {
        state.templates.push({
            title: '',
            code: '',
            notes: '',
            comment: '',
        });

        saveTaskTemplates();
    },
    templateUpdate([idx, updated]) {
        state.templates.splice(idx, 1, updated);

        saveTaskTemplates();
    },
    templateDelete([idx]) {
        state.templates.splice(idx, 1);

        saveTaskTemplates();
    },
    calendarHoveredDayCode(dayCode: string) {
        state.calendarHoveredDayCode = dayCode;
    },
    saveTasks() {
        saveTasks();
    },
    loadAsanaTasks(force = false) {
        if (!force && Object.values(state.asanaTasks).length) {
            return;
        }
        const asanaTasksCall = window.ipc.sendSync('jira.request', {
            url: `https://app.asana.com/api/1.0/workspaces/${state.settings.asana_workspace_id}/tasks/search?` +
                'opt_fields=name,assignee_section.name,permalink_url' +
                '&resource_subtype=default_task' +
                '&assignee.any=me' +
                '&completed=false' +
                '&is_subtask=false' +
                (state.settings.asana_extra_filter || ''),
            headers: {
                Authorization: `Bearer ${state.settings.asana_token}`,
                Accept: 'application/json',
                "Content-Type": "application/json",
            },
            method: 'GET',
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });

        const completedOnAfter = moment()
            .subtract(2, 'months')
            .format('YYYY-MM-DD');

        const asanaTasksCompletedCall = window.ipc.sendSync('jira.request', {
            url: `https://app.asana.com/api/1.0/workspaces/${state.settings.asana_workspace_id}/tasks/search?` +
                'opt_fields=name,assignee_section.name,permalink_url,completed_at' +
                '&resource_subtype=default_task' +
                '&assignee.any=me' +
                '&completed=true&completed_on.after=' + completedOnAfter +
                '&is_subtask=false' +
                (state.settings.asana_extra_filter || ''),
            headers: {
                Authorization: `Bearer ${state.settings.asana_token}`,
                Accept: 'application/json',
                "Content-Type": "application/json",
            },
            method: 'GET',
            redirect: "follow",
            referrerPolicy: "no-referrer",
        });

        state.asanaTasks = keyBy([
            ...asanaTasksCall.response.data,
            ...asanaTasksCompletedCall.response.data,
        ], 'gid');
    },
}

export default store;
