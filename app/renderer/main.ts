import store from './Store/Store'

import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';
import timer from "./Timer";
import {createApp} from "vue";

declare global {
    interface Window {
        ipc: Electron.IpcRenderer,
        remote: any,
    }
}

const moment = require("moment");

timer.init();

// Vue.prototype.$store = store.original;
store.loadSettings();

store.toggleDebug(window.ipc.sendSync('debug.state'));
let today = moment();
if (store.state.is_debug) {
    today.startOf('month').endOf('isoWeek');
}
store.setDay(today.format("YYYY-MM-DD"));

store.setTaskTemplates(window.ipc.sendSync('tasks.getTaskTemplates'));

window.ipc.on('change.screen', function ($event, where) {
    store.setScreen(where);
});

window.ipc.on('debug.toggle', function ($event, value) {
    store.toggleDebug(value);
});

import App from './App.vue'

const app = createApp(App);
app.use((<any>store));
app.mount("#root");

window.ipc.on('user-is-idle', function (emitter, secondsIdle, secondsToBecomeIdle) {
    if (timer.isActive()) {
        let timeredTask = store.state.tasks.get(store.state.taskTimeredId);
        if (timeredTask && timeredTask.get('code') === 'idle') {
            return; // already idle
        }
        timer.stop(secondsIdle);

        let idleTask = {...store.getEmptyTask};
        idleTask.code = 'idle';
        idleTask.time_add_idle_seconds = secondsIdle;
        idleTask.time_add_minutes = '';
        idleTask.time_record_minutes = '';
        store.createTask(idleTask);

        timer.start(store.state.createdTaskId);
        window.ipc.send('show.error', "Idle task", `Idle task was started because of inactivity.`);
    }
});

window.ipc.on('user-active-app', function (emitter, activeAppDescription) {
    if (timer.isActive()) {
        let timeredTask = store.state.tasks.get(store.state.taskTimeredId);
        console.log("[timeredTask.get('id'), activeAppDescription]", [timeredTask.get('id'), activeAppDescription]);
        store.taskAddActiveApp([timeredTask.get('id'), activeAppDescription]);
    }
});

window.ipc.on('timer-stop', function (emitter, secondsIdle, secondsToBecomeIdle) {
    if (timer.isActive()) {
        timer.stop();
    }
});
