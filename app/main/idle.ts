import activeWindow from "active-win";
import electron from "electron";
import moment from "moment";
import Filesystem from "./filesystem";
import Integrations from "./integrations";

const MINUTES = 60;
const HOURS = 60 * 60;

export default class IdleUser {
    private static seconds_to_log_active_window = 30;
    private static seconds_to_become_idle = 16 * MINUTES;
    private static seconds_to_become_offline = 2 * HOURS;
    private static seconds_to_become_offline_hard = 6 * HOURS;
    private static seconds_to_wake_up_devices = 60;
    private static isIdle = false;
    private static isOffline = false;

    private static screenLocked = false;

    private static lastWakeUp = 0;

    public static registerOnReady(mainWindow) {
        electron.powerMonitor.addListener('lock-screen', () => {
            this.screenLocked = true;
            if (Filesystem.settings.wake_up_connected_devices) {
                Integrations.lockDevices();
            }
        });

        electron.powerMonitor.addListener('unlock-screen', () => {
            this.screenLocked = false;
            if (Filesystem.settings.wake_up_connected_devices) {
                Integrations.wakeUpDevices();
            }
        });

        if (Filesystem.settings.wake_up_connected_devices) {
            this.lastWakeUp = moment.utc().unix();
            Integrations.wakeUpDevices();
        }

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

                if (Filesystem.settings.wake_up_connected_devices && !this.screenLocked) {
                    if (!this.lastWakeUp || (moment.utc().unix() - this.lastWakeUp) > this.seconds_to_wake_up_devices) {
                        this.lastWakeUp = moment.utc().unix();
                        Integrations.wakeUpDevices();
                    }
                }
            }

            if (time >= this.seconds_to_become_idle) {
                if (!this.isIdle) {
                    mainWindow.webContents.send('user-is-idle', time, this.seconds_to_become_idle);

                    Integrations.lockDevices();
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
