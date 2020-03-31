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
store.commit.setDay(moment().format("YYYY-MM-DD"));
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
        timer.stop(secondsToBecomeIdle);
        window.ipc.send('show.error', "Timer stopped", `Timer stopped because of inactivity.`);
    }
});

window.ipc.on('timer-stop', function (emitter, secondsIdle, secondsToBecomeIdle) {
    if (timer.isActive()) {
        timer.stop();
    }
});
