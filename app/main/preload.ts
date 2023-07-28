// NOTE: Restart "npm start" after any changes to this file

const {ipcRenderer} = require('electron');

const remote = require('@electron/remote');

window['ipc'] = ipcRenderer;

window['remote'] = remote;
