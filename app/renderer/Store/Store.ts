import Vue from 'vue'
import Vuex, {Store} from 'vuex'
import {timespanToText} from './../Utils/Utils';
import {List, Map} from 'immutable';
import Store_GetGroupedTasks from "./Store_GetGroupedTasks";
import {createDirectStore} from "direct-vuex";

const moment = require("moment");

Vue.use(Vuex);

function saveTasks(state:AppState) {
    window.ipc.sendSync('tasks.save', state.day_key, state.tasks.toJS(), store.getters.getTasksGrouped.toJS());
}

function saveTaskTemplates(state:AppState) {
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

const state = {
    tasks: null as Map<string, Map<string, any>>,

    tasksSelectedIds: Map<string, Boolean>({}),
    tasksHoveredId: null,
    taskEditedId: null,
    tasksScreen: 'tasks',
    taskTimeredId: null,
    timerElapsedText: null,
    timerElapsed: 0,
    screen: null,
    is_debug: true,
    day_key: '',
    allFiles: [],
    fileTotals: {},
    templates: [],
    createdTaskId: '',
};
state.screen = state.tasksScreen;

const {store} = createDirectStore({
    state: state,
    getters: {
        getTasksGrouped(state:AppState) {
            return Store_GetGroupedTasks(state);
        },

        getTasksUi(state:AppState) {
            return {
                selectedIds: state.tasksSelectedIds,
                hoveredId: state.tasksHoveredId,
                editedId: state.taskEditedId,
                timeredId: state.taskTimeredId,
                timerElapsedText: state.timerElapsedText,
                screen: state.screen,
                is_debug: state.is_debug,
                day_key: state.day_key,
            }
        },

        getEditedTask(state:AppState) {
            console.log('getEditedTask', state.taskEditedId);
            return state.tasks.get(state.taskEditedId);
        },

        getAllFiles(state:AppState) {
            return state.allFiles;
        },

        getFileTotals(state:AppState) {
            return state.fileTotals;
        },

        getTaskTemplates(state:AppState) {
            return state.templates;
        },
    },

    mutations: {
        loadTasks(state:AppState, js_tasks) {
            let tasks = Map<string, Map<string, any>>();

            if (typeof js_tasks === 'object') {
                let keys = Object.keys(js_tasks);

                for (let key of keys) {
                    let js_task = js_tasks[key];

                    let task = Map<string, any>(js_task);
                    task = task.set('sessions', List(task.get('sessions')));

                    tasks = tasks.set(key, task);
                }
            }

            state.tasks = tasks;
        },

        tasksUiHoveredId(state:AppState, id:string) {
            state.tasksHoveredId = id;
        },
        tasksUiToggle(state:AppState, id) {
            console.log(id);
            if (state.tasksSelectedIds.get(id)) {
                state.tasksSelectedIds = state.tasksSelectedIds.delete(id);
            } else {
                state.tasksSelectedIds = state.tasksSelectedIds.set(id, true);
            }
        },
        createTask(state:AppState, task) {
            const id = 'task_' + moment.utc();
            state.tasks = state.tasks.set(id, Map({
                id: id,
                code: task.code,
                title: task.title,
                distributed: false,
                chargeable: true,
                logged: false,
                notes: task.notes,
                date: task.date,
                created_at: moment().toISOString(),
                sessions: List(),
            }));
            state.createdTaskId = id;

            if (task.time_add_minutes) {
                let spentSeconds = parseInt(task.time_add_minutes) * 60;

                state.tasks = addSession(state.tasks, id, spentSeconds, 'manual');
            }

            console.log(state.tasks.toJS());

            state.screen = state.tasksScreen;

            saveTasks(state);
        },
        saveTask(state:AppState, task) {
            console.log('save', task);

            state.tasks = state.tasks.setIn([task.id, 'code'], task.code);
            state.tasks = state.tasks.setIn([task.id, 'title'], task.title);
            state.tasks = state.tasks.setIn([task.id, 'date'], task.date);
            state.tasks = state.tasks.setIn([task.id, 'notes'], task.notes);

            if (task.time_add_minutes) {
                let spentSeconds = parseInt(task.time_add_minutes) * 60;

                state.tasks = addSession(state.tasks, task.id, spentSeconds, 'manual');
            }

            state.taskEditedId = null;
            state.screen = state.tasksScreen;

            console.log(state.tasks.toJS());
            saveTasks(state);
        },
        updateTask(state:AppState, [task_id, field, value]) {
            console.log(state.tasks.get(task_id));
            state.tasks = state.tasks.setIn([task_id, field], value);
            console.log(state.tasks.toJS());

            saveTasks(state);
        },
        setScreen(state:AppState, screen) {
            state.screen = screen;
            if (screen === 'tasks' || screen === 'DayLog') {
                state.tasksScreen = screen;
            }
        },
        returnToTasksScreen(state:AppState) {
            state.screen = state.tasksScreen;
        },
        toggleDebug(state:AppState) {
            state.is_debug = !state.is_debug;
        },
        taskEdit(state:AppState, key) {
            state.taskEditedId = key;
            state.screen = 'task.edit';
        },
        setDay(state:AppState, day:string) {
            if (state.taskTimeredId) {
                alert('Cannot change date if ome task is active.');
                return;
            }
            state.day_key = day;
            let tasks = window.ipc.sendSync('tasks.load', state.day_key);
            this.commit('loadTasks', tasks);
        },
        selectHovered(state:AppState) {
            if (!state.tasksHoveredId) {
                return;
            }
            state.tasksSelectedIds = state.tasksSelectedIds.set(state.tasksHoveredId, true);
        },
        deleteSelected(state:AppState) {
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
        activateTimer(state:AppState, taskId) {
            if (taskId === null) {
                taskId = state.tasksHoveredId;
            }
            state.taskTimeredId = taskId;
            state.tasksSelectedIds = Map();
        },
        activeTimer(state:AppState, secondsElapsed) {
            state.timerElapsedText = '+' + timespanToText(secondsElapsed, '+');
            state.timerElapsed = secondsElapsed;
        },
        setAllFiles(state:AppState, allFiles) {
            state.allFiles = allFiles;
        },
        setFileTotals(state:AppState, fileTotals) {
            state.fileTotals = fileTotals;
        },
        setTaskTemplates(state:AppState, templates) {
            state.templates = templates;
        },
        stopTimer(state:AppState, [secondsElapsed, secondsIdle]) {
            console.log('secondsElapsed', secondsElapsed, 'secondsIdle', secondsIdle);

            state.tasks = addSession(state.tasks, state.taskTimeredId, secondsElapsed, 'timer', secondsIdle);

            state.tasksSelectedIds = Map();
            state.timerElapsedText = '';
            state.timerElapsed = 0;
            state.taskTimeredId = null;

            saveTasks(state);
        },
        templateNew(state:AppState) {
            state.templates.push({
                code: '',
                notes: '',
            });

            saveTaskTemplates(state);
        },
        templateUpdate(state:AppState, [idx, updated]) {
            state.templates[idx] = updated;

            saveTaskTemplates(state);
        },
        templateDelete(state:AppState, [idx]) {
            state.templates.splice(idx, 1);

            saveTaskTemplates(state);
        },
    },
});

// Export the direct-store instead of the classic Vuex store.
export default store;

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
export type AppState = typeof state;

declare module "vuex" {
    interface Store<S> {
        direct: AppStore,
    }
}
