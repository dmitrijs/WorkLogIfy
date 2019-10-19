import Shortcuts from "./shortcuts";

const {format} = require('url');

const electron = require('electron');
const isDev = require('electron-is-dev');
const {resolve} = require('app-root-path');
const path = require('path');

const {BrowserWindow, app} = electron;

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

Shortcuts.register();

app.on('ready', async () => {

    const mainWindow = new BrowserWindow({
        width: 800,
        height: 800,
        useContentSize: true,
        x: 300,
        y: 100,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            preload: path.resolve(__dirname, 'preload.js'),
        }
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (isDev) {
            mainWindow.webContents.openDevTools({
                mode: "bottom"
            })
        }
    });

    const devPath = 'http://localhost:1124';
    const prodPath = format({
        pathname: resolve('app/renderer/.parcel/production/index.html'),
        protocol: 'file:',
        slashes: true
    });
    const url = isDev ? devPath : prodPath;

    // mainWindow.setMenu(null);
    mainWindow.loadURL(url)

    {
        const {ipcMain} = require('electron')
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
    }
});

app.on('window-all-closed', app.quit);
