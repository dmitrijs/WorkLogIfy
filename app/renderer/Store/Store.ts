import {List, Map} from 'immutable';
import _ from "lodash";
import moment from "moment";
import {reactive} from "vue";
import {timespanToText} from '../Utils/Utils';
import Store_GetGroupedTasks from "./Store_GetGroupedTasks";

function saveTasks() {
    window.ipc.sendSync('tasks.save', {
        day_key: state.day_key,
        arg1: _.cloneDeep(state.tasks.toJS()),
        arg2: _.cloneDeep(store.getTasksGrouped.toJS()),
        arg3: _.cloneDeep(state.settings),
        activeApps: _.cloneDeep(state.activeApps),
    });
}

function saveTaskTemplates() {
    window.ipc.sendSync('tasks.templates.save', _.cloneDeep(state.templates));
}

function addSession(tasks, task_id, spentSeconds, method, idleSeconds = 0) {
    let sessions = tasks.get(task_id).get('sessions');
    sessions = sessions.push({
        started_at: moment().subtract(spentSeconds, 'seconds').toISOString(),
        finished_at: moment().subtract(idleSeconds, 'seconds').toISOString(),
        spent_seconds: (spentSeconds - idleSeconds),
        method: method,
    });
    return tasks.setIn([task_id, 'sessions'], sessions);
}

function addActiveApp(tasks, task_id, activeAppDescription, secondsIdle) {
    let activeApps = tasks.get(task_id).get('activeApps');
    activeApps = activeApps.push({
        noticed_at: moment().toISOString(),
        seconds_idle: secondsIdle,
        description: activeAppDescription,
    });
    return tasks.setIn([task_id, 'activeApps'], activeApps);
}

function addRecord(tasks, task_id, recordedSeconds, method, jiraWorkLogId = null) {
    let records = tasks.get(task_id).get('records');
    let record = {
        created_at: moment().toISOString(),
        recorded_seconds: recordedSeconds,
        method: method,
    };
    if (jiraWorkLogId) {
        record['jiraWorkLogId'] = jiraWorkLogId;
    }
    records = records.push(record);
    return tasks.setIn([task_id, 'records'], records);
}

const state = reactive({
    tasks: null as Map<string, Map<string, any>>,

    activeApps: [] as ActiveAppObj[],

    tasksSelectedIds: Map<string, Boolean>({}),
    taskLastSelected: '',
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
    taskInClipboard: null as Map<string, any>,
    taskIsCloned: false,
    calendarHoveredDayCode: null,

    asanaTasks: {} as Record<string, AsanaTaskObj>,

    settings: {} as SettingsObj,
});
state.screen = state.tasksScreen;

function convertJsTaskToMap(js_task: any): Map<string, any> {
    let task = Map<string, any>(js_task);
    let activeApps = task.get('activeApps');
    task = task.set('sessions', List(task.get('sessions')));
    task = task.set('records', List(task.get('records')));
    task = task.set('activeApps', List(activeApps));

    return task;
}

function convertJsTasksToMap(js_tasks): Map<string, Map<string, any>> {
    let tasks = Map<string, Map<string, any>>();

    if (typeof js_tasks === 'object') {
        let keys = Object.keys(js_tasks);

        for (let key of keys) {
            tasks = tasks.set(key, convertJsTaskToMap(js_tasks[key]));
        }
    }

    return tasks;
}

function updateTaskField(tasks: any, task_id: any, field: any, value: any) {
    console.log(tasks.get(task_id));
    tasks = tasks.setIn([task_id, field], value);
    if (value === true) {
        tasks = tasks.setIn([task_id, field + '_at'], moment().toISOString());
    } else if (value === false) {
        tasks = tasks.deleteIn([task_id, field + '_at']);
    }
    return tasks;
}

const store = {
    state,

    get getTasksGrouped(): Map<string, any> {
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
        return <TaskEditedObj>state.tasks.get(state.taskEditedId).toJS();
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
        if (state.taskLastSelected && (refTask = state.tasks.get(state.taskLastSelected))) {
            task.date = refTask.get('date');
            task.code = refTask.get('code');
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
        if (state.tasksSelectedIds.get(id)) {
            state.tasksSelectedIds = state.tasksSelectedIds.delete(id);
        } else {
            state.tasksSelectedIds = state.tasksSelectedIds.set(id, true);
        }
    },
    createTask(task) {
        const id = 'task_' + moment.utc();
        state.tasks = state.tasks.set(id, Map({
            id: id,
            code: task.code,
            title: task.title,
            distributed: false,
            chargeable: true,
            logged: false,
            frozen: !!task.frozen,
            notes: task.notes,
            comment: task.comment,
            source: task.source,
            date: task.date,
            created_at: moment().toISOString(),
            sessions: List(),
            records: List(),
            activeApps: List(),
            asanaTaskGid: task.asanaTaskGid,
        }));
        state.createdTaskId = id;

        if (task.time_add_minutes) {
            let spentSeconds = parseInt(task.time_add_minutes) * 60 || 0;

            state.tasks = addSession(state.tasks, id, spentSeconds, 'manual');
        }
        if (task.time_add_idle_seconds) {
            let seconds = parseInt(task.time_add_idle_seconds) || 0;
            state.tasks = addSession(state.tasks, id, seconds, 'idle');
        }

        console.log(state.tasks.toJS());

        state.screen = state.tasksScreen;

        saveTasks();
    },
    saveTask(task: TaskEditedObj) {
        console.log('save', task);

        state.tasks = state.tasks.setIn([task.id, 'code'], task.code);
        state.tasks = state.tasks.setIn([task.id, 'title'], task.title);
        state.tasks = state.tasks.setIn([task.id, 'date'], task.date);
        state.tasks = state.tasks.setIn([task.id, 'frozen'], !!task.frozen);
        state.tasks = state.tasks.setIn([task.id, 'notes'], task.notes);
        state.tasks = state.tasks.setIn([task.id, 'comment'], task.comment);
        state.tasks = state.tasks.setIn([task.id, 'source'], task.source);
        state.tasks = state.tasks.setIn([task.id, 'asanaTaskGid'], task.asanaTaskGid);

        if (task.time_add_minutes) {
            let spentSeconds = parseInt(task.time_add_minutes) * 60 || 0;

            state.tasks = addSession(state.tasks, task.id, spentSeconds, 'manual');
        }
        if (task.time_record_minutes) {
            let recordSeconds = parseInt(task.time_record_minutes) * 60 || 0;

            state.tasks = addRecord(state.tasks, task.id, recordSeconds, 'manual');
        }

        state.taskEditedId = null;
        state.screen = state.tasksScreen;

        console.log(state.tasks.toJS());
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
        state.tasks = addRecord(state.tasks, task_id, recordSeconds, 'quick', jiraWorkLogId);

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

        state.tasks = convertJsTasksToMap(workday.tasks);
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
            if (state.tasks.get(taskId)) {
                replaced++;
            } else {
                added++;
            }
            state.tasks = state.tasks.set(taskId, convertJsTaskToMap(tasks[taskId]));
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
        state.tasksSelectedIds = state.tasksSelectedIds.set(state.tasksHoveredId, true);
    },
    deselectAll() {
        state.tasksSelectedIds = state.tasksSelectedIds.clear();
    },
    clipboardCopy(taskId) {
        state.taskInClipboard = state.tasks.get(taskId);
        state.taskIsCloned = true;
    },
    clipboardCut(taskId) {
        state.taskInClipboard = state.tasks.get(taskId);
        state.taskIsCloned = false;

        state.tasks = state.tasks.remove(taskId);

        saveTasks();
    },
    clipboardPaste() {
        if (!state.taskInClipboard) {
            return;
        }

        const id = 'task_' + moment.utc();
        let newTask = state.taskInClipboard.set('id', id);

        if (state.taskIsCloned) {
            newTask = newTask.set('sessions', List());
            newTask = newTask.set('records', List());
            newTask = newTask.set('activeApps', List());
        }

        state.tasks = state.tasks.set(id, newTask);

        saveTasks();
    },
    activateTimer(taskId) {
        if (taskId === null) {
            taskId = state.tasksHoveredId;
        }
        state.taskTimeredId = taskId;
        state.tasksSelectedIds = Map();

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

        state.tasks = addSession(state.tasks, state.taskTimeredId, secondsElapsed, 'timer', secondsIdle);

        state.tasksSelectedIds = Map();
        state.timerElapsedText = '';
        state.timerElapsed = 0;
        state.taskTimeredId = null;

        saveTasks();
    },
    taskAddSession([taskId, minutes, method]) {
        state.tasks = addSession(state.tasks, taskId, minutes * 60, method);
        saveTasks();
    },
    taskAddActiveApp([taskId, activeAppDescription, secondsIdle]) {
        state.tasks = addActiveApp(state.tasks, taskId, activeAppDescription, secondsIdle);
        saveTasks();
    },
    addGlobalActiveApp(timeredTaskId: string, activeAppDescription: string, secondsIdle: number) {
        state.activeApps.push({
            noticed_at: moment().toISOString(),
            seconds_idle: secondsIdle,
            timered_task: timeredTaskId,
            description: activeAppDescription,
        });
        saveTasks();
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
        const asanaTasksCall = window.ipc.sendSync('jira.request', _.cloneDeep({
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
        }));
        state.asanaTasks = _.keyBy(asanaTasksCall.response.data, 'gid');
    },
}

export default store;
