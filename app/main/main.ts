import Shortcuts from "./shortcuts";
import IdleUser from "./idle";
// @ts-ignore
import taskbarPng from './assets/taskbar.png';
import Filesystem from "./filesystem";
import createMainMenu from "./menu";
import createTray, {setTrayIconActive, setTrayIconIdle} from "./tray";

const {format} = require('url');

const electron = require('electron');
const isDev = require('electron-is-dev');
const {resolve} = require('app-root-path');
const path = require('path');
const request = require('request-promise');

let tray;
const {BrowserWindow, shell, app} = electron;

if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

app.on('ready', async () => {

    const mainWindow = new BrowserWindow({
        width: 500,
        height: 500,
        useContentSize: true,
        x: 10,
        y: 10,
        show: false,
        icon: path.join(__dirname, taskbarPng),
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, 'preload.js'),
            spellcheck: true,
        }
    });

    tray = createTray(mainWindow);

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

    const devPath = 'http://localhost:1124';
    const prodPath = format({
        pathname: resolve('app/renderer/.parcel/production/index.html'),
        protocol: 'file:',
        slashes: true
    });
    const url = isDev ? devPath : prodPath;

    mainWindow.loadURL(url);

    const {ipcMain} = require('electron');

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

            request(options)
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

    mainWindow.setMenu(createMainMenu(mainWindow));

    mainWindow.on('session-end', () => {
        console.log('session-end');
        // Windows only event
        mainWindow.webContents.send('timer-stop');
    });
});

app.on('window-all-closed', app.quit);
