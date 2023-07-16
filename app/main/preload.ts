// NOTE: Restart "npm start" after any changes to this file
/* tslint:disable:no-string-literal */

const {ipcRenderer} = require('electron');

const remote = require('@electron/remote');

window['ipc'] = ipcRenderer;

window['remote'] = remote;
