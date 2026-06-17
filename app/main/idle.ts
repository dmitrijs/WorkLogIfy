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
        // Prevent Windows from throttling/suspending timers when system is idle.
        // Without this, Windows 11 Efficiency Mode can delay 30s intervals by 10+ minutes.
        electron.powerSaveBlocker.start("prevent-app-suspension");

        electron.powerMonitor.addListener("lock-screen", () => {
            this.screenLocked = true;
            if (Filesystem.settings.connected_devices_wake_up) {
                Integrations.lockDevices();
            }
        });

        electron.powerMonitor.addListener("unlock-screen", () => {
            this.screenLocked = false;
            if (Filesystem.settings.connected_devices_wake_up) {
                Integrations.wakeUpDevices();
            }
        });

        electron.powerMonitor.addListener("resume", () => {
            // System woke from sleep — fire an immediate active-app check so the gap
            // between suspend and resume is not silently skipped.
            mainWindow.webContents.send("user-active-app", {
                secondsIdle: electron.powerMonitor.getSystemIdleTime(),
                appDescription: '-"-',
            });
        });

        if (Filesystem.settings.connected_devices_wake_up) {
            this.lastWakeUp = moment.utc().unix();
            Integrations.wakeUpDevices();
        }

        setInterval(() => {
            const secondsIdle = electron.powerMonitor.getSystemIdleTime();
            (async () => {
                if (secondsIdle > this.seconds_to_log_active_window) {
                    mainWindow.webContents.send("user-active-app", {
                        secondsIdle: secondsIdle,
                        appDescription: '-"-',
                    });
                    return;
                }
                // Race against a timeout so a hung native addon can't block the event loop.
                const obj = await Promise.race([
                    activeWindow(),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
                ]);
                if (!obj) {
                    return;
                }
                mainWindow.webContents.send("user-active-app", {
                    secondsIdle: secondsIdle,
                    appDescription: `[${obj.owner?.name || obj.owner?.path || obj.title}] "${obj.title}"`,
                });
            })();
        }, this.seconds_to_log_active_window * 1000);

        setInterval(() => {
            const time = electron.powerMonitor.getSystemIdleTime();

            console.log("idle for", time, "seconds");
            if (time < this.seconds_to_become_idle) {
                this.isIdle = this.isOffline = false;

                if (Filesystem.settings.connected_devices_wake_up && !this.screenLocked) {
                    if (
                        !this.lastWakeUp ||
                        moment.utc().unix() - this.lastWakeUp > this.seconds_to_wake_up_devices
                    ) {
                        this.lastWakeUp = moment.utc().unix();
                        Integrations.wakeUpDevices();
                    }
                }
            }

            if (time >= this.seconds_to_become_idle) {
                if (!this.isIdle) {
                    mainWindow.webContents.send("user-is-idle", time, this.seconds_to_become_idle);

                    Integrations.lockDevices();
                }
                this.isIdle = true;
            }
            if (!this.isOffline) {
                const shouldStop =
                    time >= this.seconds_to_become_offline_hard ||
                    (time >= this.seconds_to_become_offline && moment.utc().hour() === 2); // end of the night

                if (shouldStop) {
                    mainWindow.webContents.send("timer-stop");
                    this.isOffline = true;
                }
            }
        }, 30 * 1000);
    }
}
