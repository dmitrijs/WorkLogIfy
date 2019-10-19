import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

import {timespanToText} from './../utils';

const store = new Vuex.Store({
    state: {
        tasks: [
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 12 * 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3 * 3600 + 54 * 60 + 45,
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 43 * 60 + 45,
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 2 * 3600 + 2 * 60 + 45,
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 1 * 60 + 45,
            },
            {
                code: 'TSKS-1243', title: 'Add some tasks to some tasks for some tasks', distributed: true, chargeable: true, logged: false,
                time_spent_seconds: 3 * 60 + 45,
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 33 * 60 + 45,
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_seconds: 3600 + 15 * 60 + 45,
            },
        ]
    },
    getters: {
        getTasks(state) {
            // populate time charge
            // populate time charge text
            // populate time spent text
            let result = [];
            for (let task of state.tasks) {
                (<any>task).time_charge_text = timespanToText(task.time_spent_seconds * 2);
                (<any>task).time_spent_text = timespanToText(task.time_spent_seconds);
                result.push(task);
            }
            return result;
        },
    }
});

export default store;
