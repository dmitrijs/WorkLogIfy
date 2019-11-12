import Vue from 'vue'
import Vuex from 'vuex'
import {timespanToText} from './../Utils/Utils';
import {List, Map} from 'immutable';
import {comparatorLt} from '../Utils/Utils';

const moment = require("moment");

Vue.use(Vuex);

function saveTasks(state) {
    window.ipc.sendSync('tasks.save', state.day_key, state.tasks.toJSON());
}

function addSession(tasks, task_id, spentSeconds, method) {
    let sessions = tasks.get(task_id).get('sessions');
    sessions = sessions.push({
        started_at: moment().subtract(spentSeconds, 'seconds').toISOString(),
        finished_at: moment().toISOString(),
        spent_seconds: spentSeconds,
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
            console.log('getTasksGrouped');
            // populate time charge
            let result;
            result = List();

            if (!state.tasks) {
                return result;
            }

            state.tasks.forEach((task, key) => {
                if (Map.isMap(task)) {
                    task = task.toJS();
                }
                (<any>task)._key = key;
                (<any>task)._selected = state.tasksSelectedIds.get(key);

                (<any>task).time_charge_text = 'error';

                let spentSeconds = task.sessions.reduce((sum, obj) => sum + obj.spent_seconds, 0);

                (<any>task).time_spent_seconds = spentSeconds;
                (<any>task).time_spent_text = timespanToText(spentSeconds);
                result = result.push(task);
            });

            result = result.groupBy((x) => x['date']);
            result = result.sortBy((val, key) => key, comparatorLt);

            //
            result = result.map((tasks) => {

                let spent = 0;
                let charge = 0;
                let distributed = 0;
                let not_distributed = 0;

                tasks.forEach((task) => {
                    const seconds = parseInt(task.time_spent_seconds);
                    spent += (seconds);
                    if (task.chargeable) {
                        charge += seconds;

                        if (task.distributed) {
                            distributed += seconds;
                        } else {
                            if (!task.frozen) {
                                not_distributed += seconds;
                            }
                        }
                    }
                });

                spent += state.timerElapsed;
                charge += state.timerElapsed;

                tasks = tasks.sort((task1, task2) => {
                    let sess1 = task1.sessions;
                    let sess2 = task2.sessions;
                    let text1 = '';
                    let text2 = '';
                    if (sess1 && sess1[0]) {
                        text1 = sess1[0].started_at;
                    }
                    if (sess2 && sess2[0]) {
                        text2 = sess2[0].started_at;
                    }
                    return comparatorLt(text1, text2);
                });

                return Map({
                    tasks: tasks,
                    time_charge_seconds: charge,
                    time_spent_seconds: spent,
                    time_distributed_seconds: distributed,
                    time_not_distributed_seconds: not_distributed,
                    time_charge_text: timespanToText(charge),
                    time_spent_text: timespanToText(spent),
                });
            });

            // populate charge_time
            result = result.map((group) => {

                let tasks = group.get('tasks');
                let distributed = group.get('time_distributed_seconds');
                let not_distributed = group.get('time_not_distributed_seconds');

                if (not_distributed === 0) {
                    return group;
                }

                tasks = tasks.map((task) => {
                    // no charging for lunch, meetings
                    if (!task.chargeable || task.distributed) {
                        task.time_charge_seconds = 0;

                    } else if (task.frozen) {
                        task.time_charge_seconds = task.time_spent_seconds;

                    } else {
                        let spent = parseInt(task.time_spent_seconds);

                        task.time_charge_seconds = spent + ((spent / not_distributed) * distributed);
                    }

                    (<any>task).time_charge_text = timespanToText(task.time_charge_seconds);
                    return task;
                });

                return group.set('tasks', tasks);
            });

            console.log(result.toJS());
            return result.toJS();
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
        stopTimer(state, secondsElapsed) {
            console.log('secondsElapsed', secondsElapsed);

            state.tasks = addSession(state.tasks, state.taskTimeredId, secondsElapsed, 'timer');

            state.tasksSelectedIds = Map();
            state.timerElapsedText = '';
            state.timerElapsed = 0;
            state.taskTimeredId = null;
        },
    },
});

export default store;
