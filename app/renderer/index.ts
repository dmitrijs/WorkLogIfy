import Vue from 'vue/dist/vue.min'
import VueRouter from 'vue-router'

import titleMixin from './utils/title'
import {createRouter} from './router'

declare global {
    interface Window {
        ipc: Electron.IpcRenderer,
        remote: Electron.Remote,
    }
}

Vue.use(VueRouter);
Vue.mixin(titleMixin);


import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';


new Vue({
    router: createRouter(),
    template: '<router-view />'
}).$mount('#root');
