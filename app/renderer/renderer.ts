import {StrictIpcRenderer} from "typesafe-ipc";
import {IpcChannelMap} from "../shared/ipcs-map";
import store from './Store/Store'

import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';
import timer from "./Timer";
import {createApp} from "vue";
import moment from "moment";

import App from './App.vue'
import IpcRendererEvent = Electron.IpcRendererEvent;

declare global {
    interface Window {
        ipc: StrictIpcRenderer<IpcChannelMap>,
        remote: any,
    }
}

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

window.ipc.on('migration', function ($event, what) {
    if (what === 'export') {
        navigator.clipboard.writeText(JSON.stringify(store.state.tasks.toJS())).then(function () {
        }, function () {
            /* clipboard write failed */
        });
    }
    if (what === 'import') {
        navigator.clipboard.readText().then((text) => {
            store.setDayFromJson(text);
        });
    }
});

const app = createApp(App);
app.use((<any>store));
app.mount("#root");

window.ipc.on('user-is-idle', function (event: IpcRendererEvent, secondsIdle) {
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
        window.ipc.send('show.error', {title: "Idle task", content: `Idle task was started because of inactivity.`});
    }
});

window.ipc.on('user-active-app', function (event: IpcRendererEvent, activeAppDescription) {
    if (timer.isActive()) {
        let timeredTask = store.state.tasks.get(store.state.taskTimeredId);
        console.log("[timeredTask.get('id'), activeAppDescription]", [timeredTask.get('id'), activeAppDescription]);
        store.taskAddActiveApp([timeredTask.get('id'), activeAppDescription]);
    }
    store.addGlobalActiveApp(activeAppDescription);
});

window.ipc.on('timer-stop', function (event: IpcRendererEvent) {
    if (timer.isActive()) {
        timer.stop();
    }
});

window.ipc.on('confirm-app-quit', function (event: IpcRendererEvent) {
    if (timer.isActive()) {
        timer.stop();
    }
    window.ipc.send('quit.confirmed');
});
