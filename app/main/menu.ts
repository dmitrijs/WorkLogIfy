const electron = require('electron');
const {Menu, app} = electron;

export function toggleDebug(mainWindow) {
    let size = mainWindow.getContentSize();
    if (size[0] === 500) {
        mainWindow.webContents.send('debug.toggle', 1);
        mainWindow.setContentSize(800, size[1]);
    } else {
        mainWindow.webContents.send('debug.toggle', 0);
        mainWindow.setContentSize(500, size[1]);//test
    }
}

export default function createMainMenu(mainWindow) {
    const isMac = process.platform === 'darwin'

    const menuItems = [
        {
            label: 'New', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'task.new');
            },
        },
        {
            label: 'Tasks', click: function () {
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
    ];
    return Menu.buildFromTemplate([
        ...(isMac ? [{
            label: 'WorkLogIfy',
            submenu: menuItems,
        }] : menuItems),
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
                    label: 'Quit', click: function () {
                        mainWindow.destroy();
                        app.quit();
                    }
                },
            ],
        },
    ]);
}
