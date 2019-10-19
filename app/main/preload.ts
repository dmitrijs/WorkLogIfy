// NOTE: Restart "npm start" after any changes to this file
/* tslint:disable:no-string-literal */

const {ipcRenderer, remote} = require('electron');

window['ipc'] = ipcRenderer;

window['remote'] = remote;
