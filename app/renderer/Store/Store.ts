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

function addRecord(tasks, task_id, recordedSeconds, method) {
    let records = tasks.get(task_id).get('records');
    records = records.push({
        created_at: moment().toISOString(),
        recorded_seconds: recordedSeconds,
        method: method,
    });
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
    tasksShowFullNotes: true,
    timerElapsedText: null,
    timerElapsed: 0,
    screen: null,
    is_debug: false,
    day_key: '',
    allFiles: [],
    fileTotals: {},
    templates: [],
    createdTaskId: '',
    taskCopied: null as Map<string, any>,

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
                tasksShowFullNotes: state.tasksShowFullNotes,
                taskCopied: state.taskCopied,
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
            console.log(state.tasks.get(task_id));
            state.tasks = state.tasks.setIn([task_id, field], value);
            if (value === true) {
                state.tasks = state.tasks.setIn([task_id, field + '_at'], moment().toISOString());
            } else if (value === false) {
                state.tasks = state.tasks.setIn([task_id, field + '_at'], null);
            }
            console.log(state.tasks.toJS());

            saveTasks(state);
        },
        taskAddRecordedSeconds(state: AppState, [task_id, recordSeconds]) {
            state.tasks = addRecord(state.tasks, task_id, recordSeconds, 'quick');

            saveTasks(state);
        },
        setScreen(state: AppState, screen) {
            state.screen = screen;
            if (screen === 'tasks' || screen === 'DayLog') {
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
        toggleTasksShowFullNotes(state: AppState) {
            state.tasksShowFullNotes = !state.tasksShowFullNotes;
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
        deleteSelected(state: AppState) {
            console.log('state.tasksSelectedIds.size', state.tasksSelectedIds.size);
            if (!state.tasksSelectedIds.size) {
                return;
            }

            if (!confirm('Delete ' + state.tasksSelectedIds.size + ' tasks?')) {
                return;
            }

            console.log('state.tasks', state.tasks);

            state.tasks = state.tasksSelectedIds.keySeq().reduce((map, key) => map.delete(key), state.tasks);
            state.tasksSelectedIds = Map();

            saveTasks(state);
        },
        clipboardCopySelected(state: AppState) {
            console.log('state.tasksSelectedIds.size', state.tasksSelectedIds.size);
            if (!state.tasksSelectedIds.size) {
                return;
            }
            if (state.tasksSelectedIds.size > 1) {
                alert('Copying multiple tasks is not yet supported');
                return;
            }

            let taskId = state.tasksSelectedIds.keySeq().first();
            state.taskCopied = state.tasks.get(taskId);

            state.tasksSelectedIds = state.tasksSelectedIds.clear();
            state.tasksHoveredId = null;
        },
        clipboardCutSelected(state: AppState) {
            console.log('state.tasksSelectedIds.size', state.tasksSelectedIds.size);
            if (!state.tasksSelectedIds.size) {
                return;
            }
            if (state.tasksSelectedIds.size > 1) {
                alert('Cutting multiple tasks is not yet supported');
                return;
            }

            let taskId = state.tasksSelectedIds.keySeq().first();
            state.taskCopied = state.tasks.get(taskId);

            state.tasks = state.tasks.remove(taskId);
            state.tasksSelectedIds = state.tasksSelectedIds.clear();
            state.tasksHoveredId = null;

            saveTasks(state);
        },
        clipboardPaste(state: AppState) {
            if (!state.taskCopied) {
                return;
            }

            const id = 'task_' + moment.utc();
            let newTask = state.taskCopied.set('id', id);

            state.tasks = state.tasks.set(id, newTask);

            saveTasks(state);
        },
        activateTimer(state: AppState, taskId) {
            if (taskId === null) {
                taskId = state.tasksHoveredId;
            }
            state.taskTimeredId = taskId;
            state.tasksSelectedIds = Map();
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
