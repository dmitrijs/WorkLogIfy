class Integrations {
    public static wakeUpDevices() {
        if (process.platform === 'darwin') {
            return;
        }
        console.log('Waking up devices');

        this.getAndroidState().then((result: AndroidState) => {
            if (!result.screenOn) {
                this.wakeUpAndroid();
            }
            if (!result.screenUnlocked) {
                this.unlockAndroid();
            }
        });

        this.getAndroidState().then((result: AndroidState) => {
            if (result.screenOn) {
                this.lockAndroid();
            }
        });
    }

    public static lockDevices() {
        if (process.platform === 'darwin') {
            return;
        }
        console.log('Locking devices');

        this.getAndroidState().then((result: AndroidState) => {
            if (result.screenOn) {
                this.lockAndroid();
            }
        });
    }

    // ---

    private static wakeUpAndroid() {
        this.runShell('adb.exe', ['shell', 'input', 'keyevent', '26']).then();
    }

    private static unlockAndroid() {
        this.runShell('adb.exe', ['shell', 'input', 'touchscreen', '2', '4400', '500', '2']).then(() => {
            this.runShell('adb.exe', ['shell', 'input', 'text', '0000']).then()
        });
    }

    private static lockAndroid() {
        this.runShell('adb.exe', ['shell', 'input', 'keyevent', '26']).then();
    }

    private static getAndroidState() {
        return new Promise((resolve, reject) => {
            this.runShell('adb.exe', ['shell', 'dumpsys', 'deviceidle']).then((result: ShellResult) => {
                let screenOn = null, screenUnlocked = null;
                if (result.code === 0) {
                    screenOn = result.stdout.match(/mScreenOn=(true|false)/)[1] === 'true';
                    screenUnlocked = result.stdout.match(/mScreenLocked=(true|false)/)[1] === 'false';
                }
                resolve({screenOn, screenUnlocked} as AndroidState);
            });
        });
    }

    public static runShell(executable: string, args: string[]) {
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
