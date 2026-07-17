import * as electron from "electron";
import { app, BrowserWindow, Menu, shell } from "electron";
import isDev from "electron-is-dev";
import { isArray, isObject } from "lodash";
import path from "path";
import { StrictIpcMain } from "typesafe-ipc";
import createCalendarMenu from "../renderer/Tasks/CalendarMenu";
import createMenu from "../renderer/Tasks/TasksMenu";
import { IpcChannelMap } from "../shared/ipcs-map";
import Filesystem from "./filesystem";
import IdleUser from "./idle";
import Integrations from "./integrations";
import createMainMenu from "./menu";
import Shortcuts from "./shortcuts";
import createTray, { setTrayIconActive, setTrayIconIdle } from "./tray";

const ipcMain: StrictIpcMain<IpcChannelMap> = electron.ipcMain;

app.disableHardwareAcceleration();

process.env.DIST_ELECTRON = path.join(__dirname, "..");
process.env.DIST = path.join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? path.join(process.env.DIST_ELECTRON, "../public")
    : process.env.DIST;

const url = process.env.VITE_DEV_SERVER_URL || "";
const indexHtml = path.join(process.env.DIST, "index.html");

if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
}

let quitConfirmed = false;

let mainWindow;
app.on("ready", async () => {
    Filesystem.getSettings();

    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        ...(isDev
            ? {
                  width: 800,
              }
            : {
                  width: 500,
                  minWidth: 500,
                  maxWidth: 500,
              }),
        height: 800,
        useContentSize: true,
        x: 10,
        y: 10,
        show: false,
        icon: path.join(process.env.PUBLIC || "", "/assets/app_icon.png"),
        webPreferences: {
            preload: path.resolve(__dirname, "../preload/preload.js"),
            spellcheck: true,
            contextIsolation: false, // to work in Electron 12+
            nodeIntegration: true, // to work in Electron 20+
        },
    });

    createTray(mainWindow);

    mainWindow.on("close", function (event: Electron.IpcMainEvent) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        if (isDev) {
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
        ipcMain.on("timer-state", (event: Electron.IpcMainEvent, arg) => {
            console.log("timer-state", arg);
            switch (arg) {
                case "stopped":
                    setTrayIconIdle();
                    break;
                case "active":
                    setTrayIconActive();
                    break;
            }
            event.reply("asynchronous-reply", "ok");
        });

        ipcMain.on("asynchronous-message", (event: Electron.IpcMainEvent, arg) => {
            console.log(arg); // prints "ping"
            event.reply("asynchronous-reply", "pong");
        });

        ipcMain.on("synchronous-message", (event: Electron.IpcMainEvent, arg) => {
            console.log(arg); // prints "ping"
            event.returnValue = "pong";
        });

        ipcMain.on("show.error", (_event: Electron.IpcMainEvent, error) => {
            electron.dialog.showErrorBox(error.title, error.content);
            return "";
        });

        ipcMain.on("flash.frame", (_event: Electron.IpcMainEvent) => {
            mainWindow.once("focus", () => mainWindow.flashFrame(false));
            mainWindow.flashFrame(true);
        });

        ipcMain.on("jira.request", (event: Electron.IpcMainEvent, options) => {
            console.log("options", options);

            fetch(options.url, options)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    console.log("jira.request succeeded", data);
                    event.returnValue = { response: data };
                })
                .catch((err) => {
                    console.error(err);
                    const cause = err.cause?.message || err.cause?.code || err.cause;
                    event.returnValue = { error: cause ? `${err.message}: ${cause}` : err.message };
                });
        });

        ipcMain.on("shell.openExternal", (_event: Electron.IpcMainEvent, url: string) => {
            shell.openExternal(url);
        });

        ipcMain.on("window.open", (event: Electron.IpcMainEvent) => {
            const display = electron.screen.getPrimaryDisplay();

            const width = 300,
                height = 200;

            const win2 = new BrowserWindow({
                width: width,
                height: height,
                useContentSize: true,
                x: display.bounds.width - width - 50,
                y: display.bounds.height - height - 150,
                frame: false,
            });
            win2.show();
            win2.loadURL(url);

            event.returnValue = "ok";
        });

        ipcMain.on("debug.state", (event: Electron.IpcMainEvent) => {
            event.returnValue = isDev;
        });

        ipcMain.on("integrations.lock", (_event: Electron.IpcMainEvent) => {
            Integrations.lockDevices();
        });

        ipcMain.on("integrations.wakeup", (_event: Electron.IpcMainEvent) => {
            Integrations.wakeUpDevices();
        });

        ipcMain.on(
            "tasks.save",
            (
                event: Electron.IpcMainEvent,
                { day_key, arg1: worklog, arg2: worklogProcessed, arg3: settings },
            ) => {
                console.log("saving tasks");
                Filesystem.saveWorkLog(day_key, worklog, worklogProcessed, settings);
                event.returnValue = "ok";
            },
        );

        ipcMain.on("activeApps.save", (event: Electron.IpcMainEvent, { day_key, activeApps }) => {
            console.log("saving activeApps");
            Filesystem.saveActiveApps(day_key, activeApps);
            event.returnValue = "ok";
        });

        ipcMain.on("tasks.templates.save", (event: Electron.IpcMainEvent, taskTemplates) => {
            console.log("saving task templates");
            Filesystem.saveTaskTemplates(taskTemplates);
            event.returnValue = "ok";
        });

        ipcMain.on("tasks.projects.save", (event: Electron.IpcMainEvent, taskProjects) => {
            console.log("saving task projects");
            Filesystem.saveTaskProjects(taskProjects);
            event.returnValue = "ok";
        });

        ipcMain.on("tasks.load", (event: Electron.IpcMainEvent, day_key) => {
            let workday: any = Filesystem.getWorkLog(day_key);

            if (!workday.version) {
                // v1
                workday = <any>{
                    tasks: workday as any,
                    activeApps: [],
                };
            }

            if (!workday.tasks || !isObject(workday.tasks) || isArray(workday.tasks)) {
                workday.tasks = {};
            }
            event.returnValue = workday;
        });

        ipcMain.on("settings.load", (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getSettings();
        });

        ipcMain.on("tasks.getFileTotals", (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getFileTotals();
        });

        ipcMain.on("tasks.getTaskTemplates", (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getTaskTemplates();
        });

        ipcMain.on("tasks.getTaskProjects", (event: Electron.IpcMainEvent) => {
            event.returnValue = Filesystem.getTaskProjects();
        });

        ipcMain.on("quit.confirmed", (_event: Electron.IpcMainEvent) => {
            quitConfirmed = true;
            app.quit();
        });

        ipcMain.on("quit.unconfirmed", (_event: Electron.IpcMainEvent) => {
            app.quit();
        });

        ipcMain.on("tasks.showMenu", (_event: Electron.IpcMainEvent, params) => {
            console.log("tasks.showMenu", params);
            createMenu(mainWindow, params).popup();
        });

        ipcMain.on("calendar.showMenu", (_event: Electron.IpcMainEvent, params) => {
            console.log("calendar.showMenu", params);
            createCalendarMenu(mainWindow, params).popup();
        });

        ipcMain.on("set.progress", (_event: Electron.IpcMainEvent, params) => {
            if (process.platform !== "darwin") {
                if (params.indeterminate === true) {
                    mainWindow.setProgressBar(1.1);
                } else if (params.indeterminate === false) {
                    mainWindow.setProgressBar(-1);
                }
            }
            if (typeof params.progress !== "undefined") {
                mainWindow.setProgressBar(params.progress);
            }
        });
    }

    const mainMenu = createMainMenu(mainWindow);
    Menu.setApplicationMenu(mainMenu);
    mainWindow.setMenu(mainMenu);

    mainWindow.on("session-end", () => {
        console.log("session-end");
        // Windows only event
        mainWindow.webContents.send("timer-stop");
    });
});

app.on("before-quit", async (e) => {
    if (!mainWindow) {
        return;
    }

    if (!quitConfirmed) {
        e.preventDefault();
        mainWindow.webContents.send("confirm-app-quit");
        return;
    }

    mainWindow.removeAllListeners("close");
    mainWindow.close();
});

app.on("activate", () => {
    if (!mainWindow) {
        return;
    }

    mainWindow.show();
});

app.on("window-all-closed", () => {
    mainWindow = null;
    if (process.platform !== "darwin") app.quit();
});
