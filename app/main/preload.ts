// NOTE: Restart "npm start" after any changes to this file

import {ipcRenderer} from "electron";
import remote from "@electron/remote";

window['ipc'] = ipcRenderer;

window['remote'] = remote;
