import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

import {timespanToText} from './../utils';
import * as _ from 'lodash';
import {fromJS, List, Map} from 'immutable';

const store = new Vuex.Store({
    state: {
        tasks: fromJS({
            1: Map({
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            }),
            2: Map({
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 12 * 3600 + 15 * 60 + 45,
            }),
            3: {
                id: 3,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3 * 3600 + 54 * 60 + 45,
            },
            4: {
                id: 4,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 43 * 60 + 45,
            },
            5: {
                id: 5,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 2 * 3600 + 2 * 60 + 45,
            },
            6: {
                id: 6,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 1 * 60 + 45,
            },
            7: {
                id: 7,
                code: 'TSKS-1243', title: 'Add some tasks to some tasks for some tasks', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 3 * 60 + 45,
            },
            8: {
                id: 8,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 33 * 60 + 45,
            },
            9: {
                id: 9,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            10: {
                id: 10,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            11: {
                id: 11,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            12: {
                id: 12,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            13: {
                id: 13,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            14: {
                id: 14,
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            15: {
                id: 15,
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            16: {
                id: 16,
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
        }),

        tasksSelectedIds: Map<Number, Boolean>({}),
        tasksHoveredId: -1,
    },
    getters: {
        getTasks(state) {
            // populate time charge
            let result = [];

            state.tasks.forEach((task, key) => {
                if (Map.isMap(task)) {
                    task = task.toJS();
                }
                (<any>task)._key = key;
                (<any>task)._selected = state.tasksSelectedIds.get(key);
                (<any>task).time_charge_text = timespanToText(task.time_spent_seconds * 2);
                (<any>task).time_spent_text = timespanToText(task.time_spent_seconds);
                result.push(task);
            });
            return result;
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
