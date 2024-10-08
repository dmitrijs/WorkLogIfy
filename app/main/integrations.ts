class Integrations {
    public static async wakeUpDevices() {
        if (process.platform === 'darwin') {
            return;
        }
        console.log('> Waking up devices');

        this.getAndroidState().then(async (result: AndroidState) => {
            if (!result.screenOn) {
                console.log('>> wakeUpAndroid');
                await this.wakeUpAndroid();
            }
            if (!result.screenUnlocked) {
                console.log('>> unlockAndroid');
                await this.unlockAndroid();
            }

            console.log('>> go fullscreen');

            setTimeout(async () => {
                await this.runShell('adb.exe', `shell input touchscreen tap 200 200`);
                await this.runShell('adb.exe', 'shell input keyevent 34').then() // press 'f' to go full screen
            }, 500);
        });
    }

    public static async lockDevices() {
        if (process.platform === 'darwin') {
            return;
        }
        console.log('Locking devices');

        this.getAndroidState().then(async (result: AndroidState) => {
            if (result.screenOn) {
                await this.lockAndroid();
            }
        });
    }

    // ---

    private static async wakeUpAndroid() {
        return this.runShell('adb.exe', 'shell input keyevent 26').then();
    }

    private static async unlockAndroid() {
        await this.runShell('adb.exe', 'shell input touchscreen swipe 400 600 400 100');
        await this.runShell('adb.exe', 'shell input text 0000');
        return this.runShell('adb.exe', 'shell input keyevent 66');
    }

    private static lockAndroid() {
        return this.runShell('adb.exe', 'shell input keyevent 26').then();
    }

    private static getAndroidState() {
        return new Promise((resolve, reject) => {
            this.runShell('adb.exe', 'shell dumpsys deviceidle').then((result: ShellResult) => {
                let screenOn = null, screenUnlocked = null;
                if (result.code === 0) {
                    screenOn = result.stdout.match(/mScreenOn=(true|false)/)[1] === 'true';
                    screenUnlocked = result.stdout.match(/mScreenLocked=(true|false)/)[1] === 'false';
                }
                resolve({screenOn, screenUnlocked} as AndroidState);
            });
        });
    }

    public static runShell(executable: string, args: string | string[]) {
        if (typeof args === 'string') {
            args = args.split(' ');
        }
        console.log('shell:', [executable, ...args].join(' '));
        return new Promise((resolve, error) => {
            let spawn = require("child_process").spawn;

            let bat = spawn(executable, args);

            let stdout = '';
            let stderr = '';

            bat.stdout.on("data", (data: Buffer) => {
                stdout += data.toString();
            });

            bat.stderr.on("data", (data: Buffer) => {
                stderr += data.toString();
            });

            bat.on("exit", (code: number) => {
                resolve({code, stdout, stderr} as ShellResult);
            });
        })
    }
}

export default Integrations;
