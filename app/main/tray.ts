import * as path from "path";
import electron from "electron";

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

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                mainWindow.show();
            }
        },
        {
            label: 'Quit', click: function () {
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
