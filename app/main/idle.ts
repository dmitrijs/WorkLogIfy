const electron = require('electron');

export default class IdleUser {
    private static seconds_to_become_idle = 16 * 60;
    private static seconds_to_become_offline = 2 * 60 * 60;
    private static isIdle = false;
    private static isOffline = false;

    public static registerOnReady(mainWindow) {
        setInterval(() => {
            const time = electron.powerMonitor.getSystemIdleTime();

            console.log('idle for', time, 'seconds');
            if (time < this.seconds_to_become_idle) {
                this.isIdle = this.isOffline = false;
            }

            if (time >= this.seconds_to_become_idle) {
                if (!this.isIdle) {
                    mainWindow.webContents.send('user-is-idle', time, this.seconds_to_become_idle);
                }
                this.isIdle = true;
            }
            if (time >= this.seconds_to_become_offline) {
                if (!this.isOffline) {
                    mainWindow.webContents.send('timer-stop');
                }
                this.isOffline = true;
            }
        }, 30 * 1000);
    }
}
