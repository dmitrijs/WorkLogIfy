import Vue from 'vue/dist/vue.min'
import store from './Store/Store'

import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';
import App from "./App.vue";
import timer from "./Timer";

declare global {
    interface Window {
        ipc: Electron.IpcRenderer,
        remote: Electron.Remote,
    }
}

const moment = require("moment");

timer.init();

Vue.prototype.$store = store.original;
store.commit.loadSettings();

store.commit.toggleDebug(window.ipc.sendSync('debug.state'));
let today = moment();
if (store.state.is_debug) {
    today.startOf('month').endOf('isoWeek');
}
store.commit.setDay(today.format("YYYY-MM-DD"));

store.commit.setTaskTemplates(window.ipc.sendSync('tasks.getTaskTemplates'));

window.ipc.on('change.screen', function ($event, where) {
    store.commit.setScreen(where);
});

window.ipc.on('debug.toggle', function ($event, value) {
    store.commit.toggleDebug(value);
});

let vue = new Vue({
    render: h => h(App),
}).$mount('#root');

window.ipc.on('user-is-idle', function (emitter, secondsIdle, secondsToBecomeIdle) {
    if (timer.isActive()) {
        let timeredTask = store.state.tasks.get(store.state.taskTimeredId);
        if (timeredTask && timeredTask.get('code') === 'idle') {
            return; // already idle
        }
        timer.stop(secondsToBecomeIdle);

        let idleTask = Object.create(store.getters.getEmptyTask);
        idleTask.code = 'idle';
        idleTask.time_add_idle_seconds = secondsToBecomeIdle;
        idleTask.time_add_minutes = '';
        idleTask.time_record_minutes = '';
        store.commit.createTask(idleTask);

        timer.start(store.state.createdTaskId);
        window.ipc.send('show.error', "Idle task", `Idle task was started because of inactivity.`);
    }
});

window.ipc.on('timer-stop', function (emitter, secondsIdle, secondsToBecomeIdle) {
    if (timer.isActive()) {
        timer.stop();
    }
});
