import Shortcuts from "./shortcuts";
import IdleUser from "./idle";
import Filesystem from "./filesystem";
import createMainMenu from "./menu";
import createTray, {setTrayIconActive, setTrayIconIdle} from "./tray";
import electron, {BrowserWindow, shell, app, Menu, ipcMain} from 'electron'
import {enable, initialize} from "@electron/remote/main";
import path from "path";
import isDev from "electron-is-dev";

process.env.DIST_ELECTRON = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? path.join(process.env.DIST_ELECTRON, '../public')
    : process.env.DIST

const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = path.join(process.env.DIST, 'index.html')

if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

initialize()

let mainWindow = null;
app.on('ready', async () => {

    mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        useContentSize: true,
        x: 10,
        y: 10,
        show: false,
        icon: path.join(process.env.PUBLIC, '/assets/app_icon.png'),
        webPreferences: {
            preload: path.resolve(__dirname, '../preload/preload.js'),
            spellcheck: true,
            contextIsolation: false, // to work in Electron 12+
            nodeIntegration: true, // to work in Electron 20+
        }
    });
    enable(mainWindow.webContents)

    createTray(mainWindow);

    mainWindow.on('close', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.setContentSize(800, 800);

            mainWindow.webContents.openDevTools({
                mode: "bottom"
            });
        }
    });

    mainWindow.webContents.on("new-window", function (event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    Shortcuts.registerOnReady();
    IdleUser.registerOnReady(mainWindow);

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(url);
    } else {
        mainWindow.loadFile(indexHtml);
    }

    {
        ipcMain.on('timer-state', (event, arg) => {
            console.log('timer-state', arg)
            switch (arg) {
                case 'stopped':
                    setTrayIconIdle();
                    break;
                case 'active':
                    setTrayIconActive();
                    break;
            }
            event.reply('asynchronous-reply', 'ok')
        });

        ipcMain.on('asynchronous-message', (event, arg) => {
            console.log(arg) // prints "ping"
            event.reply('asynchronous-reply', 'pong')
        })

        ipcMain.on('synchronous-message', (event, arg) => {
            console.log(arg) // prints "ping"
            event.returnValue = 'pong'
        })

        ipcMain.on('show.error', (event, title, content) => {
            electron.dialog.showErrorBox(title, content);
        });

        ipcMain.on('jira.request', (event, options) => {
            console.log('options', options);

            // TODO: `request-promise` was replaced with `fetch`, code was not adjusted
            fetch(options)
                .then(response => {
                    console.log('jira.request succeeded', response);
                    event.returnValue = {response: response};
                })
                .catch(err => {
                    alert(err.message);
                    event.returnValue = {error: err.message};
                });
        });

        ipcMain.on('window.open', (event, arg) => {
            console.log(arg) // prints "ping"

            let display = electron.screen.getPrimaryDisplay();

            let width = 300, height = 200;

            let win2 = new BrowserWindow({
                width: width,
                height: height,
                useContentSize: true,
                x: display.bounds.width - width - 50,
                y: display.bounds.height - height - 150,
                frame: false,
            });
            win2.show();
            win2.loadURL(url);

            event.returnValue = 'ok'
        });

        ipcMain.on('debug.state', (event, arg) => {
            event.returnValue = isDev;
        });

        ipcMain.on('tasks.save', (event, day_key, arg1, arg2, arg3) => {
            console.log('saving tasks');
            Filesystem.saveWorkLog(day_key, arg1, arg2, arg3);
            event.returnValue = 'ok'
        });

        ipcMain.on('tasks.templates.save', (event, arg1) => {
            console.log('saving task templates');
            Filesystem.saveTaskTemplates(arg1);
            event.returnValue = 'ok'
        });

        ipcMain.on('tasks.load', (event, arg) => {
            event.returnValue = Filesystem.getWorkLog(arg);
        });

        ipcMain.on('settings.load', (event) => {
            event.returnValue = Filesystem.getSettings();
        });

        ipcMain.on('tasks.getFileTotals', (event) => {
            event.returnValue = Filesystem.getFileTotals();
        });

        ipcMain.on('tasks.getTaskTemplates', (event) => {
            event.returnValue = Filesystem.getTaskTemplates();
        });
    }

    const mainMenu = createMainMenu(mainWindow);
    Menu.setApplicationMenu(mainMenu);
    mainWindow.setMenu(mainMenu);

    mainWindow.on('session-end', () => {
        console.log('session-end');
        // Windows only event
        mainWindow.webContents.send('timer-stop');
    });
});

app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});
app.on('window-all-closed', () => {
    mainWindow = null
    if (process.platform !== 'darwin') app.quit()
});
