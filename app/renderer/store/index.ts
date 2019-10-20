import Vue from 'vue'
import Vuex from 'vuex'
import {timespanToText} from './../utils';
import * as _ from 'lodash';
import {fromJS, List, Map} from 'immutable';
import {comparatorLt} from '../utils';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        tasks: fromJS({
            1: Map({
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: false,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-16',
            }),
            2: Map({
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 12 * 3600 + 15 * 60 + 45,
                date: '2019-10-16',
            }),
            3: {
                id: 3,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: false,
                time_spent_seconds: 3 * 3600 + 54 * 60 + 45,
                date: '2019-10-16',
            },
            4: {
                id: 4,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: false,
                time_spent_seconds: 43 * 60 + 45,
                date: '2019-10-14',
            },
            5: {
                id: 5,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 2 * 3600 + 2 * 60 + 45,
                date: '2019-10-07',
            },
            6: {
                id: 6,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: false,
                time_spent_seconds: 1 * 60 + 45,
                date: '2019-10-10',
            },
            7: {
                id: 7,
                code: 'TSKS-1243', title: 'Add some tasks to some tasks for some tasks', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 3 * 60 + 45,
                date: '2019-10-10',
            },
            8: {
                id: 8,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 33 * 60 + 45,
                date: '2019-10-10',
            },
            9: {
                id: 9,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-10',
            },
            10: {
                id: 10,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-12',
            },
            11: {
                id: 11,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-12',
            },
            12: {
                id: 12,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-12',
            },
            13: {
                id: 13,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-13',
            },
            14: {
                id: 14,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: false,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-14',
            },
            15: {
                id: 15,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-16',
            },
            16: {
                id: 16,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: false,
                time_spent_seconds: 3600 + 15 * 60 + 45,
                date: '2019-10-16',
            },
        }),

        tasksSelectedIds: Map<Number, Boolean>({}),
        tasksHoveredId: -1,
    },
    getters: {
        getTasksGrouped(state) {
            // populate time charge
            let result;
            result = List();

            state.tasks.forEach((task, key) => {
                if (Map.isMap(task)) {
                    task = task.toJS();
                }
                (<any>task)._key = key;
                (<any>task)._selected = state.tasksSelectedIds.get(key);
                (<any>task).time_charge_text = timespanToText(task.time_spent_seconds * 2);
                (<any>task).time_spent_text = timespanToText(task.time_spent_seconds);
                result = result.push(task);
            });

            result = result.groupBy((x) => x['date']);
            result = result.sortBy((val, key) => key, comparatorLt);
            result = result.map((tasks) => {

                const timeCharge = tasks.map((x) => (x.chargeable ? x.time_spent_seconds : 0))
                    .reduce((x, y) => x + y, 0);

                const timeSpent = tasks.map((x) => (x.time_spent_seconds))
                    .reduce((x, y) => x + y, 0);

                return Map({
                    tasks: tasks,
                    time_charge_text: timespanToText(timeCharge),
                    time_spent_text: timespanToText(timeSpent),
                });
            });

            console.log(result.toJS());
            return result.toJS();
        },

        getTasksUi(state) {
            return {
                selectedIds: state.tasksSelectedIds,
                hoveredId: state.tasksHoveredId,
            }
        },
    },

    mutations: {
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
        updateTask(state, [task_id, field, value]) {
            console.log(state.tasks.get(task_id));
            state.tasks = state.tasks.setIn([task_id, field], value);
            console.log(state.tasks.toJS());
        },
    },
});

export default store;
