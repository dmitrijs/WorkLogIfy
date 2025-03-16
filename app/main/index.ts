import * as electron from 'electron'
import {app, BrowserWindow, Menu, shell} from 'electron'
import isDev from "electron-is-dev";
import {isArray, isObject} from "lodash";
import path from "path";
import {StrictIpcMain} from "typesafe-ipc";
import createCalendarMenu from "../renderer/Tasks/CalendarMenu";
import createMenu from "../renderer/Tasks/TasksMenu";
import {IpcChannelMap} from "../shared/ipcs-map";
import Filesystem from "./filesystem";
import IdleUser from "./idle";
import Integrations from "./integrations";
import createMainMenu from "./menu";
import Shortcuts from "./shortcuts";
import createTray, {setTrayIconActive, setTrayIconIdle} from "./tray";

const ipcMain: StrictIpcMain<IpcChannelMap> = electron.ipcMain;

app.disableHardwareAcceleration();

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

let quitConfirmed = false;

let mainWindow = null;
app.on('ready', async () => {
    Filesystem.getSettings();

    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 500,
        height: 800,
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
        },
    });

    createTray(mainWindow);

    mainWindow.on('close', function (event: Electron.IpcMainEvent) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.setContentSize(800, 800);

            mainWindow.webContents.openDevTools({
                mode: "bottom",
            });
        }
    });

    mainWindow.webContents.on("new-window", function (event: Electron.IpcMainEvent, url) {
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
        ipcMain.on('timer-state', (event: Electron.IpcMainEvent, arg) => {
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

        ipcMain.on('asynchronous-message', (event: Electron.IpcMainEvent, arg) => {
            console.log(arg) // prints "ping"
            event.reply('asynchronous-reply', 'pong')
        })

        ipcMain.on('synchronous-message', (event: Electron.IpcMainEvent, arg) => {
            console.log(arg) // prints "ping"
            event.returnValue = 'pong'
        })

        ipcMain.on('show.error', (event: Electron.IpcMainEvent, error) => {
            electron.dialog.showErrorBox(error.title, error.content);
            return '';
        });

        ipcMain.on('flash.frame', (event: Electron.IpcMainEvent) => {
            mainWindow.once('focus', () => mainWindow.flashFrame(false))
            mainWindow.flashFrame(true)
        });

        ipcMain.on('jira.request', (event: Electron.IpcMainEvent, options) => {
            console.log('options', options);

            fetch(options.url, options)
                .then(response => {
                    return response.json();
                })
                .then((data) => {
                    console.log('jira.request succeeded', data);
                    event.returnValue = {response: data};
                })
                .catch(err => {
                    console.error(err.message);
                    event.returnValue = {error: err.message};
                });
        });

        ipcMain.on('window.open', (event: Electron.IpcMainEvent) => {
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

        ipcMain.on('debug.state', (event: Electron.IpcMainEvent) => {
            event.returnValue = isDev;
        });

        ipcMain.on('integrations.lock', (event: Electron.IpcMainEvent) => {
            Integrations.lockDevices();
        });

        ipcMain.on('integrations.wakeup', (event: Electron.IpcMainEvent) => {
            Integrations.wakeUpDevices();
        });

        ipcMain.on('tasks.save', (event: Electron.IpcMainEvent, {day_key, arg1: worklog, arg2: worklogProcessed, arg3: settings}) => {
            console.log('saving tasks');
            Filesystem.saveWorkLog(day_key, worklog, worklogProcessed, settings);
            event.returnValue = 'ok'
        });

        ipcMain.on('activeApps.save', (event: Electron.IpcMainEvent, {day_key, activeApps}) => {
            console.log('saving activeApps');
            Filesystem.saveActiveApps(day_key, activeApps);
            event.returnValue = 'ok'
        });

        ipcMain.on('tasks.templates.save', (event: Electron.IpcMainEvent, taskTemplates) => {
            console.log('saving task templates');
            Filesystem.saveTaskTemplates(taskTemplates);
            event.returnValue = 'ok'
        });

        ipcMain.on('tasks.load', (event: Electron.IpcMainEvent, day_key) => {
            let workday = Filesystem.getWorkLog(day_key);

            if (!(<any>workday).version) { // v1
                workday = <any>{
                    tasks: workday as any,
                    activeApps: [],
                }
            }

            if (!workday.hasOwnProperty('tasks') || !isObject((<any>workday).tasks) || isArray((<any>workday).tasks)) {
                (<any>workday).tasks = {};
            }
            event.returnValue = workday;
        });

        ipcMain.on('settings.load', (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getSettings();
        });

        ipcMain.on('tasks.getFileTotals', (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getFileTotals();
        });

        ipcMain.on('tasks.getTaskTemplates', (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getTaskTemplates();
        });

        ipcMain.on('quit.confirmed', (event: Electron.IpcMainEvent) => {
            quitConfirmed = true;
            app.quit();
        });

        ipcMain.on('quit.unconfirmed', (event: Electron.IpcMainEvent) => {
            app.quit();
        });

        ipcMain.on('tasks.showMenu', (event: Electron.IpcMainEvent, params) => {
            console.log('tasks.showMenu', params)
            createMenu(mainWindow, params).popup();
        });

        ipcMain.on('calendar.showMenu', (event: Electron.IpcMainEvent, params) => {
            console.log('calendar.showMenu', params)
            createCalendarMenu(mainWindow, params).popup();
        });

        ipcMain.on('set.progress', (event: Electron.IpcMainEvent, params) => {
            if (process.platform !== 'darwin') {
                if (params.indeterminate === true) {
                    mainWindow.setProgressBar(1.1);
                } else if (params.indeterminate === false) {
                    mainWindow.setProgressBar(-1);
                }
            }
            if (typeof params.progress !== 'undefined') {
                mainWindow.setProgressBar(params.progress);
            }
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

app.on('before-quit', async (e) => {
    if (!quitConfirmed) {
        e.preventDefault();
        mainWindow.webContents.send('confirm-app-quit');
        return;
    }

    mainWindow.removeAllListeners('close');
    mainWindow.close();
});

app.on('activate', () => {
    mainWindow.show();
});

app.on('window-all-closed', () => {
    mainWindow = null
    if (process.platform !== 'darwin') app.quit()
});
