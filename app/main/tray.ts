import * as path from "path";
// @ts-ignore
import trayPng from './assets/tray.png';
// @ts-ignore
import trayActivePng from './assets/trayActive.png';

const electron = require('electron');
const {Menu, Tray, app} = electron;

let tray;

export function setTrayIconIdle() {
    tray.setImage(path.join(__dirname, trayPng));
}

export function setTrayIconActive() {
    tray.setImage(path.join(__dirname, trayActivePng));
}

export default function createTray(mainWindow) {
    tray = new Tray(path.join(__dirname, trayPng));

    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Quit', click: function () {
                mainWindow.destroy();
                app.quit();
            }
        }
    ]);
    tray.on('click', function (e) {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
    tray.setIgnoreDoubleClickEvents(true);
    tray.setContextMenu(contextMenu);
}
