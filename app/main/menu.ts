const electron = require('electron');
const {Menu, app} = electron;

export function toggleDebug(mainWindow) {
    let size = mainWindow.getContentSize();
    if (size[0] === 500) {
        mainWindow.webContents.send('debug.toggle', 1);
        mainWindow.setContentSize(800, size[1]);
    } else {
        mainWindow.webContents.send('debug.toggle', 0);
        mainWindow.setContentSize(500, Math.min(500, size[1]));
    }
}

export default function createMainMenu(mainWindow) {
    return Menu.buildFromTemplate([
        {
            label: 'New', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'task.new');
            }
        },
        {
            label: 'My Tasks', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'tasks');
            }
        },
        {
            label: 'Calendar', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'calendar');
            }
        },
        {
            label: 'Templates', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'task.templates');
            }
        },
        {
            label: 'Settings', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'settings');
            }
        },
        {
            label: '...',
            submenu: [
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
                {
                    label: 'Reload', click: function () {
                        mainWindow.reload();
                    }
                },
                {type: 'separator'},
                {
                    label: 'Report (deprecated)', click: function () {
                        mainWindow.show();
                        mainWindow.webContents.send('change.screen', 'DayLog');
                    }
                },
                {type: 'separator'},
                {
                    label: 'Quit', click: function () {
                        mainWindow.destroy();
                        app.quit();
                    }
                },
            ],
        },
    ]);
}
