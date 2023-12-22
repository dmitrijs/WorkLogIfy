import activeWindow from "active-win";
import electron from "electron";
import moment from "moment";

const MINUTES = 60;
const HOURS = 60 * 60;

export default class IdleUser {
    private static seconds_to_log_active_window = 30;
    private static seconds_to_become_idle = 16 * MINUTES;
    private static seconds_to_become_offline = 2 * HOURS;
    private static seconds_to_become_offline_hard = 6 * HOURS;
    private static isIdle = false;
    private static isOffline = false;

    public static registerOnReady(mainWindow) {
        setInterval(() => {
            const secondsIdle = electron.powerMonitor.getSystemIdleTime();
            (async () => {
                if (secondsIdle > this.seconds_to_log_active_window) {
                    mainWindow.webContents.send('user-active-app', {secondsIdle: secondsIdle, appDescription: '-"-'});
                    return;
                }
                let obj = await activeWindow();
                if (!obj) {
                    return;
                }
                mainWindow.webContents.send('user-active-app', {secondsIdle: secondsIdle, appDescription: `[${obj.owner?.name || obj.owner?.path || obj.title}] "${obj.title}"`});
            })();
        }, this.seconds_to_log_active_window * 1000);

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
            if (!this.isOffline) {
                const shouldStop =
                    time >= this.seconds_to_become_offline_hard
                    || (time >= this.seconds_to_become_offline && moment.utc().hour() === 2); // end of the night

                if (shouldStop) {
                    mainWindow.webContents.send('timer-stop');
                    this.isOffline = true;
                }
            }
        }, 30 * 1000);
    }
}
