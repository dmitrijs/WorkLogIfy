const electron = require('electron')

export default class IdleUser {
    private static seconds_to_become_idle = 30;
    private static isIdle = false;

    public static registerOnReady(mainWindow, eventName) {
        setInterval(() => {
            electron.powerMonitor.querySystemIdleTime((time) => {
                if (time < this.seconds_to_become_idle) {
                    this.isIdle = false;
                }

                if (time >= this.seconds_to_become_idle) {
                    if (!this.isIdle) {
                        mainWindow.webContents.send(eventName, time);
                    }
                    this.isIdle = true;
                }
            });
        }, 10 * 1000);
    }
}
