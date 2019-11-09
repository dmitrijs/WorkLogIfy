const electron = require('electron');
const {Menu} = electron;

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
            label: 'DayLog', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'DayLog');
            }
        },
        {
            label: 'Toggle Debug', click: function () {
                mainWindow.webContents.send('debug.toggle');
            }
        },
    ]);
}
