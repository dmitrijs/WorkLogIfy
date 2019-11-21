const electron = require('electron');
const {Menu} = electron;

export function toggleDebug(mainWindow) {
    mainWindow.webContents.send('debug.toggle');
    let size = mainWindow.getContentSize();
    if (size[0] === 500) {
        mainWindow.setContentSize(800, size[1]);
    } else {
        mainWindow.setContentSize(500, Math.min(500, size[1]));
    }
}

export default function createMainMenu(mainWindow) {
    return Menu.buildFromTemplate([
        {
            label: 'List', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'tasks');
            }
        },
        {
            label: 'New', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'task.new');
            }
        },
        {
            label: 'Calendar', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'calendar');
            }
        },
        {
            label: 'DayLog', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'DayLog');
            }
        },
        {
            label: 'Toggle Debug', click: function () {
                toggleDebug(mainWindow);
            }
        },
        {
            label: 'Dev Tools', click: function () {
                mainWindow.openDevTools();
            }
        },
    ]);
}
