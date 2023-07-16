import * as path from "path";
// @ts-ignore

const electron = require('electron');
const {Menu, Tray, app} = electron;

let tray;

export function setTrayIconIdle() {
    tray.setImage(path.join(process.env.PUBLIC, '/assets/trayInactive.png'));
}

export function setTrayIconActive() {
    tray.setImage(path.join(process.env.PUBLIC, '/assets/tray.png'));
}

export default function createTray(mainWindow) {
    tray = new Tray(path.join(process.env.PUBLIC, '/assets/trayInactive.png'));

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
