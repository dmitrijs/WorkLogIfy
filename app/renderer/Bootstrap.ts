import Vue from 'vue/dist/vue.min'

declare global {
    interface Window {
        ipc: Electron.IpcRenderer,
        remote: Electron.Remote,
    }
}

import store from './Store/Store'

import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';
import App from "./App.vue";

Vue.prototype.$store = store;
store.commit('setDayNow');

let tasks = window.ipc.sendSync('tasks.load', store.state.day_key);
store.commit('loadTasks', tasks);

window.ipc.on('change.screen', function($event, where) {
    store.commit('setScreen', where);
});

window.ipc.on('debug.toggle', function($event) {
    store.commit('toggleDebug');
});

let vue = new Vue({
    render: h => h(App),
}).$mount('#root');

window.ipc.on('user-is-idle', function (emitter, secondsIdle) {
    console.log(`You are idle now! ${secondsIdle} seconds passed.`);
});
