import Vue from 'vue/dist/vue.min'
import VueRouter from 'vue-router'

import {createRouter} from './router'

declare global {
    interface Window {
        ipc: Electron.IpcRenderer,
        remote: Electron.Remote,
    }
}

Vue.use(VueRouter);

import store from './store'

import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';

Vue.prototype.$store = store;

new Vue({
    router: createRouter(),
    template: '<router-view />'
}).$mount('#root');
