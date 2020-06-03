import Vue from 'vue'
import Vuex, {Store} from 'vuex'
import {timespanToText} from '../Utils/Utils';
import {List, Map} from 'immutable';
import Store_GetGroupedTasks from "./Store_GetGroupedTasks";
import {createDirectStore} from "direct-vuex";

const moment = require("moment");

Vue.use(Vuex);

function saveTasks(state: AppState) {
    window.ipc.sendSync('tasks.save', state.day_key, state.tasks.toJS(), storeDirect.getters.getTasksGrouped.toJS(), state.settings.toJS());
}

function saveTaskTemplates(state: AppState) {
    window.ipc.sendSync('tasks.templates.save', state.templates);
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

const state = {
    tasks: null as Map<string, Map<string, any>>,

    tasksSelectedIds: Map<string, Boolean>({}),
    tasksHoveredId: null,
    taskEditedId: null,
    tasksScreen: 'tasks',
    taskTimeredId: null,
    tasksShowAsReport: false,
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

    settings: null as Map<string, any>,
};
state.screen = state.tasksScreen;

function convertJsTasksToMap(js_tasks): Map<string, Map<string, any>> {
    let tasks = Map<string, Map<string, any>>();

    if (typeof js_tasks === 'object') {
        let keys = Object.keys(js_tasks);

        for (let key of keys) {
            let js_task = js_tasks[key];

            let task = Map<string, any>(js_task);
            task = task.set('sessions', List(task.get('sessions')));
            task = task.set('records', List(task.get('records')));

            tasks = tasks.set(key, task);
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

const {store: storeDirect} = createDirectStore({
    state: state,
    getters: {
        getTasksGrouped(state: AppState): Map<string, any> {
            return Store_GetGroupedTasks(state);
        },

        getTasksUi(state: AppState) {
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
                taskInClipboard: state.taskInClipboard,
            }
        },

        getEditedTask(state: AppState): TaskEditedObj {
            console.log('getEditedTask', state.taskEditedId);
            return state.tasks.get(state.taskEditedId).toJS();
        },

        getEmptyTask(state: AppState): TaskEditedObj {
            return {
                code: '',
                title: '',
                frozen: false,
                time_spent_seconds: 0,
                date: state.day_key,
                time_add_minutes: '',
                time_record_minutes: '',
            } as TaskEditedObj;
        },

        getFileTotals(state: AppState) {
            return state.fileTotals;
        },

        getTaskTemplates(state: AppState) {
            return state.templates;
        },
    },

    mutations: {
        tasksUiHoveredId(state: AppState, id: string) {
            state.tasksHoveredId = id;
        },
        tasksUiToggle(state: AppState, id: string) {
            console.log(id);
            if (state.tasksSelectedIds.get(id)) {
                state.tasksSelectedIds = state.tasksSelectedIds.delete(id);
            } else {
                state.tasksSelectedIds = state.tasksSelectedIds.set(id, true);
            }
        },
        createTask(state: AppState, task) {
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
                date: task.date,
                created_at: moment().toISOString(),
                sessions: List(),
                records: List(),
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

            saveTasks(state);
        },
        saveTask(state: AppState, task: TaskEditedObj) {
            console.log('save', task);

            state.tasks = state.tasks.setIn([task.id, 'code'], task.code);
            state.tasks = state.tasks.setIn([task.id, 'title'], task.title);
            state.tasks = state.tasks.setIn([task.id, 'date'], task.date);
            state.tasks = state.tasks.setIn([task.id, 'frozen'], !!task.frozen);
            state.tasks = state.tasks.setIn([task.id, 'notes'], task.notes);

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
            saveTasks(state);
        },
        updateTask(state: AppState, [task_id, field, value]) {
            state.tasks = updateTaskField(state.tasks, task_id, field, value);
            if ((field === 'chargeable' && !value) || (field === 'distributed' && value)) {
                state.tasks = updateTaskField(state.tasks, task_id, 'is_done', true);
            }
            saveTasks(state);
        },
        taskAddRecordedSeconds(state: AppState, [task_id, recordSeconds, jiraWorkLogId]) {
            state.tasks = addRecord(state.tasks, task_id, recordSeconds, 'quick', jiraWorkLogId);

            saveTasks(state);
        },
        setScreen(state: AppState, screen) {
            state.screen = screen;
            if (screen === 'tasks') {
                state.tasksScreen = screen;
            }
        },
        returnToTasksScreen(state: AppState) {
            state.screen = state.tasksScreen;
        },
        toggleDebug(state: AppState, value) {
            state.is_debug = value;
        },
        toggleTasksShowAsReport(state: AppState) {
            state.tasksShowAsReport = !state.tasksShowAsReport;
        },
        taskEdit(state: AppState, key) {
            state.taskEditedId = key;
            state.screen = 'task.edit';
        },
        setDay(state: AppState, day: string) {
            if (state.taskTimeredId) {
                alert('Cannot change date if some task is active.');
                return;
            }
            state.day_key = day;
            state.week_key = moment(day, "YYYY-MM-DD").endOf('isoWeek').format('YYYY-WW');
            let tasks = window.ipc.sendSync('tasks.load', state.day_key);

            state.tasks = convertJsTasksToMap(tasks);
        },
        loadSettings(state: AppState) {
            let settings_json = window.ipc.sendSync('settings.load');

            state.settings = Map<string, any>(settings_json);
        },
        updateSettings(state: AppState, settings) {
            state.settings = Map(settings);
            saveTasks(state);
        },
        openNextDay(state: AppState) {
            let today = moment(state.day_key, 'YYYY-MM-DD');
            let tomorrow = today.add(1, 'day').format('YYYY-MM-DD');
            this.commit('setDay', tomorrow);
        },
        selectHovered(state: AppState) {
            if (!state.tasksHoveredId) {
                return;
            }
            state.tasksSelectedIds = state.tasksSelectedIds.set(state.tasksHoveredId, true);
        },
        deselectAll(state: AppState) {
            state.tasksSelectedIds = state.tasksSelectedIds.clear();
        },
        clipboardCopy(state: AppState, taskId) {
            state.taskInClipboard = state.tasks.get(taskId);
            state.taskIsCloned = true;
        },
        clipboardCut(state: AppState, taskId) {
            state.taskInClipboard = state.tasks.get(taskId);
            state.taskIsCloned = false;

            state.tasks = state.tasks.remove(taskId);

            saveTasks(state);
        },
        clipboardPaste(state: AppState) {
            if (!state.taskInClipboard) {
                return;
            }

            const id = 'task_' + moment.utc();
            let newTask = state.taskInClipboard.set('id', id);

            if (state.taskIsCloned) {
                newTask = newTask.set('sessions', List());
                newTask = newTask.set('records', List());
            }

            state.tasks = state.tasks.set(id, newTask);

            saveTasks(state);
        },
        activateTimer(state: AppState, taskId) {
            if (taskId === null) {
                taskId = state.tasksHoveredId;
            }
            state.taskTimeredId = taskId;
            state.tasksSelectedIds = Map();

            state.tasks = updateTaskField(state.tasks, taskId, 'is_on_hold', false);
            saveTasks(state);
        },
        activeTimer(state: AppState, secondsElapsed) {
            state.timerElapsedText = '+' + timespanToText(secondsElapsed, '+');
            state.timerElapsed = secondsElapsed;
        },
        setFileTotals(state: AppState, fileTotals) {
            state.fileTotals = fileTotals;
        },
        setTaskTemplates(state: AppState, templates) {
            state.templates = templates;
        },
        stopTimer(state: AppState, [secondsElapsed, secondsIdle]) {
            console.log('secondsElapsed', secondsElapsed, 'secondsIdle', secondsIdle);

            state.tasks = addSession(state.tasks, state.taskTimeredId, secondsElapsed, 'timer', secondsIdle);

            state.tasksSelectedIds = Map();
            state.timerElapsedText = '';
            state.timerElapsed = 0;
            state.taskTimeredId = null;

            saveTasks(state);
        },
        taskAddSession(state: AppState, [taskId, minutes, method]) {
            state.tasks = addSession(state.tasks, taskId, minutes * 60, method);
            saveTasks(state);
        },
        templateNew(state: AppState) {
            state.templates.push({
                title: '',
                code: '',
                notes: '',
            });

            saveTaskTemplates(state);
        },
        templateUpdate(state: AppState, [idx, updated]) {
            state.templates.splice(idx, 1, updated);

            saveTaskTemplates(state);
        },
        templateDelete(state: AppState, [idx]) {
            state.templates.splice(idx, 1);

            saveTaskTemplates(state);
        },
    },
});

// Export the direct-store instead of the classic Vuex store.
export default storeDirect;

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof storeDirect;
export type AppState = typeof state;

declare module "vuex" {
    interface Store<S> {
        direct: AppStore,
    }
}
