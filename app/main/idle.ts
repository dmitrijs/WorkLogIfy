const electron = require('electron');

export default class IdleUser {
    private static seconds_to_become_idle = 16 * 60;
    private static isIdle = false;

    public static registerOnReady(mainWindow, eventName) {
        setInterval(() => {
            electron.powerMonitor.querySystemIdleTime((time) => {
                console.log('idle for', time, 'seconds');
                if (time < this.seconds_to_become_idle) {
                    this.isIdle = false;
                }

                if (time >= this.seconds_to_become_idle) {
                    if (!this.isIdle) {
                        mainWindow.webContents.send(eventName, time, this.seconds_to_become_idle);
                    }
                    this.isIdle = true;
                }
            });
        }, 30 * 1000);
    }
}
