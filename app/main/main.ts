import Shortcuts from "./shortcuts";
import IdleUser from "./idle";
// @ts-ignore
import taskbarPng from './assets/taskbar.png';
import Filesystem from "./filesystem";
import createMainMenu from "./menu";
import createTray from "./tray";

const {format} = require('url');

const electron = require('electron');
const isDev = require('electron-is-dev');
const {resolve} = require('app-root-path');
const path = require('path');

let tray;
const {BrowserWindow, app} = electron;

if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

app.on('ready', async () => {

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        useContentSize: true,
        x: 10,
        y: 10,
        show: false,
        icon: path.join(__dirname, taskbarPng),
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, 'preload.js'),
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
            mainWindow.webContents.openDevTools({
                mode: "bottom"
            })
        }
    });

    Shortcuts.registerOnReady();
    IdleUser.registerOnReady(mainWindow, 'user-is-idle');

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
        ipcMain.on('asynchronous-message', (event, arg) => {
            console.log(arg) // prints "ping"
            event.reply('asynchronous-reply', 'pong')
        })

        ipcMain.on('synchronous-message', (event, arg) => {
            console.log(arg) // prints "ping"
            event.returnValue = 'pong'
        })

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
            win2.loadURL(url)

            event.returnValue = 'ok'
        });

        ipcMain.on('tasks.save', (event, day_key, arg) => {
            Filesystem.saveWorkLog(day_key, arg);
            event.returnValue = 'ok'
        });

        ipcMain.on('tasks.load', (event, arg) => {
            event.returnValue = Filesystem.getWorkLog(arg);
        });

        ipcMain.on('tasks.allfiles', (event) => {
            event.returnValue = Filesystem.getAllFiles();
        });
    }

    mainWindow.setMenu(createMainMenu(mainWindow));

});

app.on('window-all-closed', app.quit);
