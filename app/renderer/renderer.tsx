import {StrictIpcRenderer} from "typesafe-ipc";
import {IpcChannelMap} from "../shared/ipcs-map";
import { useStoreContext} from './Store/Store'

import './../style.scss';
import './../../external/icofont/icofont.min.css';
import './../../external/checkbox.scss';
import timer from "./Timer";
import {createApp} from "vue";
import {createRoot} from 'react-dom/client'
import moment from "moment";

import AppBase from './AppBase'
import IpcRendererEvent = Electron.IpcRendererEvent;

declare global {
    interface Window {
        ipc: StrictIpcRenderer<IpcChannelMap>,
        remote: any,
    }
}

timer.init();

// const app = createApp(AppBase);
// app.use((<any>store));
// app.mount("#root");

createRoot(document.getElementById('root')!).render(
    <AppBase />
)
