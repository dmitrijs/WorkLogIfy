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

Vue.prototype.$store = store;
store.commit('setDay', moment().format("YYYY-MM-DD"));

let allFiles = window.ipc.sendSync('tasks.allfiles');
store.commit('setAllFiles', allFiles);

window.ipc.on('change.screen', function ($event, where) {
    store.commit('setScreen', where);
});

window.ipc.on('debug.toggle', function ($event) {
    store.commit('toggleDebug');
});

const {app} = remote;
document.title += ' v' + app.getVersion();

let vue = new Vue({
    render: h => h(App),
}).$mount('#root');

window.ipc.on('user-is-idle', function (emitter, secondsIdle, secondsToBecomeIdle) {
    if (timer.isActive()) {
        timer.stop(secondsToBecomeIdle);
        window.ipc.send('show.error', "Timer stopped", `Timer stopped because of inactivity.`);
    }
});
