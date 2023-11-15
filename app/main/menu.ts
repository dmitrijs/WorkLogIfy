import electron from "electron";

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
            },
        },
        {
            label: 'Calendar', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'calendar');
            },
        },
        {
            label: 'Active Apps', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'active_apps');
            },
        },
        {
            label: 'Templates', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'task.templates');
            },
        },
        {
            label: 'Settings', click: function () {
                mainWindow.show();
                mainWindow.webContents.send('change.screen', 'settings');
            },
        },
    ];
    return Menu.buildFromTemplate([
        ...(isMac ? [{
            label: 'WorkLogIfy',
            submenu: menuItems,
        }] : menuItems),
        ...(isMac ? [{
            label: "Edit",
            submenu: [
                {label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo"},
                {label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", role: "redo"},
                {type: "separator"},
                {label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut"},
                {label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy"},
                {label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste"},
                {label: "Select All", accelerator: "CmdOrCtrl+A", role: "selectAll"},
            ],
        } as any] : []),
        {
            label: '...',
            submenu: [
                {
                    label: 'Toggle Debug', click: function () {
                        toggleDebug(mainWindow);
                    },
                },
                {
                    label: 'Dev Tools', click: function () {
                        mainWindow.openDevTools();
                    },
                },
                {
                    label: 'Reload', click: function () {
                        mainWindow.reload();
                    },
                },
                {
                    label: 'Export today to clipboard', click: function () {
                        mainWindow.show();
                        mainWindow.webContents.send('migration', 'export');
                    },
                },
                {
                    label: 'Import today from clipboard', click: function () {
                        mainWindow.show();
                        mainWindow.webContents.send('migration', 'import');
                    },
                },
                {type: 'separator'},
                {
                    label: 'Quit', click: function () {
                        app.quit();
                    },
                    ...(isMac && {accelerator: "CmdOrCtrl+Q"}),
                },
            ],
        },
    ]);
}
