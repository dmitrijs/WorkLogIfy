import Vue from 'vue'
import Vuex from 'vuex'
import {timespanToText} from './../Utils/Utils';
import {List, Map} from 'immutable';
import Store_GetGroupedTasks from "./Store_GetGroupedTasks";

const moment = require("moment");

Vue.use(Vuex);

function saveTasks(state) {
    window.ipc.sendSync('tasks.save', state.day_key, state.tasks.toJSON());
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

const store = new Vuex.Store({
    state: {
        tasks: null,

        tasksSelectedIds: Map<Number, Boolean>({}),
        tasksHoveredId: null,
        taskEditedId: null,
        taskTimeredId: null,
        timerElapsedText: null,
        timerElapsed: 0,
        screen: 'tasks',
        is_debug: true,
        day_key: '',
        allFiles: [],
    },
    getters: {
        getTasksGrouped(state) {
            return Store_GetGroupedTasks(state);
        },

        getTasksUi(state) {
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

        getEditedTask(state) {
            console.log('getEditedTask', state.taskEditedId);
            return state.tasks.get(state.taskEditedId);
        },

        getAllFiles(state) {
            return state.allFiles;
        },
    },

    mutations: {
        loadTasks(state, js_tasks) {
            let tasks = Map();

            if (typeof js_tasks === 'object') {
                let keys = Object.keys(js_tasks);

                for (let key of keys) {
                    let js_task = js_tasks[key];

                    let task = Map(js_task);
                    task = task.set('sessions', List(task.get('sessions')));

                    tasks = tasks.set(key, task);
                }
            }

            state.tasks = tasks;
        },

        tasksUiHoveredId(state, id) {
            state.tasksHoveredId = id;
        },
        // tasksUiSelect(state, id) {
        //     state.tasksSelectedIds[id] = true;
        // },
        // tasksUiDeselect(state, id) {
        //     delete state.tasksSelectedIds[id];
        // },
        tasksUiToggle(state, id) {
            console.log(id);
            if (state.tasksSelectedIds.get(id)) {
                state.tasksSelectedIds = state.tasksSelectedIds.delete(id);
            } else {
                state.tasksSelectedIds = state.tasksSelectedIds.set(id, true);
            }
        },
        createTask(state, task) {
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

            if (task.time_add_minutes) {
                let spentSeconds = parseInt(task.time_add_minutes) * 60;

                state.tasks = addSession(state.tasks, id, spentSeconds, 'manual');
            }

            console.log(state.tasks.toJS());

            state.screen = 'tasks';

            saveTasks(state);
        },
        saveTask(state, task) {
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
            state.screen = 'tasks';

            console.log(state.tasks.toJS());
            saveTasks(state);
        },
        updateTask(state, [task_id, field, value]) {
            console.log(state.tasks.get(task_id));
            state.tasks = state.tasks.setIn([task_id, field], value);
            console.log(state.tasks.toJS());

            saveTasks(state);
        },
        setScreen(state, screen) {
            state.screen = screen;
        },
        toggleDebug(state) {
            state.is_debug = !state.is_debug;
        },
        taskEdit(state, key) {
            state.screen = 'task.edit';
            state.taskEditedId = key;
        },
        setDay(state, day) {
            if (state.taskTimeredId) {
                alert('Cannot change date if ome task is active.');
                return;
            }
            state.day_key = day;
            let tasks = window.ipc.sendSync('tasks.load', state.day_key);
            this.commit('loadTasks', tasks);
        },
        selectHovered(state) {
            if (!state.tasksHoveredId) {
                return;
            }
            state.tasksSelectedIds = state.tasksSelectedIds.set(state.tasksHoveredId, true);
        },
        deleteSelected(state) {
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
        activateTimer(state) {
            state.taskTimeredId = state.tasksHoveredId;
            state.tasksSelectedIds = Map();
        },
        activeTimer(state, secondsElapsed) {
            state.timerElapsedText = '+' + timespanToText(secondsElapsed, '+');
            state.timerElapsed = secondsElapsed;
        },
        setAllFiles(state, allFiles) {
            state.allFiles = allFiles;
        },
        stopTimer(state, [secondsElapsed, secondsIdle]) {
            console.log('secondsElapsed', secondsElapsed, 'secondsIdle', secondsIdle);

            state.tasks = addSession(state.tasks, state.taskTimeredId, secondsElapsed, 'timer', secondsIdle);

            state.tasksSelectedIds = Map();
            state.timerElapsedText = '';
            state.timerElapsed = 0;
            state.taskTimeredId = null;
        },
    },
});

export default store;
