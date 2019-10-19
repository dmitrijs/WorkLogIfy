import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        tasks: [
            {
                code: 'TSKS-1243', title: 'Add some tasks to some tasks for some tasks', distributed: true, chargeable: true, logged: false,
                time_spent_text: '5m',
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_text: '1h 7m',
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_text: '2h 55m',
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_text: '14h 15m',
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_text: '1h 7m',
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_text: '2h 55m',
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_text: '14h 15m',
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_text: '1h 7m',
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_text: '2h 55m',
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_text: '14h 15m',
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_text: '1h 7m',
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_text: '2h 55m',
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_text: '14h 15m',
            },
            {
                code: 'TSKS-1111', title: 'Create task from some sentence and that is it', distributed: false, chargeable: true, logged: true,
                time_spent_text: '1h 7m',
            },
            {
                code: 'TSKS-3333', title: 'Blog creation', distributed: true, chargeable: true, logged: true,
                time_spent_text: '2h 55m',
            },
            {
                code: 'TSKS-5444',
                title: 'Enjoy a rest ater this work is done to have some not at all exception there is not a thing for this',
                distributed: true,
                chargeable: true,
                logged: true,
                time_spent_text: '14h 15m',
            },
        ]
    },
    getters: {}
});

export default store;
