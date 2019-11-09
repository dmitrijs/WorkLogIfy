import Vue from 'vue'
import Vuex from 'vuex'
import {timespanToText} from './../Utils/Utils';
import {fromJS, List, Map} from 'immutable';
import {comparatorLt} from '../Utils/Utils';

const moment = require("moment");

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        tasks: null,
        // fromJS({
        // 1: Map({
        //     code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: false, logged: false,
        //     time_spent_seconds: 3600 + 15 * 60 + 45,
        //     date: '2019-10-16',
        // }),
        // 2: Map({
        //     code: 'TSKS-3333', title: 'Blog creation', distributed: true, frozen: true, chargeable: false, logged: false,
        //     time_spent_seconds: 12 * 3600 + 15 * 60 + 45,
        //     date: '2019-10-16',
        // }),
        // 3: {
        //     id: 3,
        //     code: 'TSKS-5444',
        //     title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
        //     distributed: true, frozen: false,
        //     chargeable: false,
        //     logged: false,
        //     time_spent_seconds: 3 * 3600 + 54 * 60 + 45,
        //     date: '2019-10-16',
        // },
        // 4: {
        //     id: 4,
        //     code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: false,
        //     time_spent_seconds: 43 * 60 + 45,
        //     date: '2019-10-14',
        // },
        // 5: {
        //     id: 5,
        //     code: 'TSKS-3333', title: 'Blog creation', distributed: true, frozen: false, chargeable: true, logged: false,
        //     time_spent_seconds: 2 * 3600 + 2 * 60 + 45,
        //     date: '2019-10-07',
        // },
        // 6: {
        //     id: 6,
        //     code: 'TSKS-5444',
        //     title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
        //     distributed: true, frozen: true,
        //     chargeable: true,
        //     logged: false,
        //     time_spent_seconds: 1 * 60 + 45,
        //     date: '2019-10-10',
        // },
        // 7: {
        //     id: 7,
        //     code: 'TSKS-1243',
        //     title: 'Add some tasks to some tasks for some tasks',
        //     distributed: true,
        //     frozen: false,
        //     chargeable: true,
        //     logged: false,
        //     time_spent_seconds: 3 * 60 + 45,
        //     date: '2019-10-10',
        // },
        // 8: {
        //     id: 8,
        //     code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
        //     time_spent_seconds: 3600 + 33 * 60 + 45,
        //     date: '2019-10-10',
        // },
        // 9: {
        //     id: 9,
        //     code: 'TSKS-3333', title: 'Blog creation', distributed: true, frozen: true, chargeable: true, logged: false,
        //     time_spent_seconds: 3600 + 15 * 60 + 45,
        //     date: '2019-10-10',
        // },
        // 10: {
        //     id: 10,
        //     code: 'TSKS-5444',
        //     title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
        //     distributed: true, frozen: true,
        //     chargeable: true,
        //     logged: true,
        //     time_spent_seconds: 3600 + 15 * 60 + 45,
        //     date: '2019-10-12',
        // },
        // 11: {
        //     id: 11,
        //     code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
        //     time_spent_seconds: 3600 + 15 * 60 + 45,
        //     date: '2019-10-12',
        // },
        // 12: {
        //     id: 12,
        //     code: 'TSKS-3333', title: 'Blog creation', distributed: true, frozen: true, chargeable: true, logged: false,
        //     time_spent_seconds: 3600 + 15 * 60 + 45,
        //     date: '2019-10-12',
        // },
        // 13: {
        //     id: 13,
        //     code: 'TSKS-5444',
        //     title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
        //     distributed: true, frozen: false,
        //     chargeable: true,
        //     logged: false,
        //     time_spent_seconds: 4 * 3600 + 0 * 60 + 0,
        //     date: '2019-10-16',
        // },
        // 14: {
        //     id: 14,
        //     code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: false,
        //     time_spent_seconds: 3 * 3600 + 0 * 60 + 0,
        //     date: '2019-10-16',
        // },
        // 15: {
        //     id: 15,
        //     code: 'TSKS-3333', title: 'Blog creation', distributed: true, frozen: false, chargeable: true, logged: false,
        //     time_spent_seconds: 2 * 3600 + 0 * 60 + 0,
        //     date: '2019-10-16',
        // },
        // 16: {
        //     id: 16,
        //     code: 'TSKS-5444',
        //     title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
        //     distributed: true, frozen: true,
        //     chargeable: true,
        //     logged: false,
        //     time_spent_seconds: 3600 + 0 * 60 + 0,
        //     date: '2019-10-16',
        // },
        // }),

        tasksSelectedIds: Map<Number, Boolean>({}),
        tasksHoveredId: null,
        taskEditedId: null,
        taskTimeredId: null,
        screen: 'tasks',
        is_debug: true,
        day_key: '',
    },
    getters: {
        getTasksGrouped(state) {
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

                (<any>task).time_spent_text = timespanToText(task.time_spent_seconds);
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
                    spent += (task.time_spent_seconds);
                    if (task.chargeable) {
                        charge += task.time_spent_seconds;

                        if (task.distributed) {
                            distributed += task.time_spent_seconds;
                        } else {
                            if (!task.frozen) {
                                not_distributed += task.time_spent_seconds;
                            }
                        }
                    }
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
                        let spent = task.time_spent_seconds;

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
                screen: state.screen,
                is_debug: state.is_debug,
                day_key: state.day_key,
            }
        },

        getEditedTask(state) {
            return state.tasks.get(state.taskEditedId);
        },
    },

    mutations: {
        loadTasks(state, js_tasks) {
            let tasks = Map();

            if (typeof js_tasks === 'object') {
                let keys = Object.keys(js_tasks);

                for (let key of keys) {
                    let js_task = js_tasks[key];

                    tasks = tasks.set(key, fromJS(js_task));
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
                time_spent_seconds: 0,
                notes: '',
                date: task.date_key,
            }));
            console.log(state.tasks.toJS());

            state.screen = 'tasks';

            window.ipc.sendSync('tasks.save', state.tasks.toJSON());
        },
        saveTask(state, task) {
            state.tasks = state.tasks.setIn([task.id, 'code'], task.code);
            state.tasks = state.tasks.setIn([task.id, 'title'], task.title);
            state.tasks = state.tasks.setIn([task.id, 'date'], task.date);
            state.tasks = state.tasks.setIn([task.id, 'notes'], task.notes);

            console.log(state.tasks.toJS());
            window.ipc.sendSync('tasks.save', state.tasks.toJSON());
        },
        updateTask(state, [task_id, field, value]) {
            console.log(state.tasks.get(task_id));
            state.tasks = state.tasks.setIn([task_id, field], value);
            console.log(state.tasks.toJS());

            window.ipc.sendSync('tasks.save', state.tasks.toJSON());
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
        setDayNow(state) {
            state.day_key = moment().format("YYYY-MM-DD");
        },
        activateTimer(state) {
            state.taskTimeredId = state.tasksHoveredId;
        },
        stopTimer(state) {
            state.taskTimeredId = null;
        },
    },
});

export default store;
