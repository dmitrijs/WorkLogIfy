const {app, globalShortcut} = require('electron')

export default class Shortcuts {
    public static register() {
        app.on('ready', () => {
            this.registerOne('CommandOrControl+Shift+Home');
            this.registerOne('CommandOrControl+Shift+PageUp');
            this.registerOne('CommandOrControl+Shift+PageDown');
            this.registerOne('CommandOrControl+Shift+Insert');
        });

        app.on('will-quit', () => {
            globalShortcut.unregisterAll();
        })
    }

    private static registerOne(shortcut: string) {
        const ret = globalShortcut.register(shortcut, () => this.process(shortcut));
        if (!ret) {
            console.log('registration failed')
        }
    }

    private static process(shortcut) {
        switch (shortcut) {
            case 'CommandOrControl+Shift+Home':
                console.log('home is pressed');
                break;
            case 'CommandOrControl+Shift+PageUp':
                console.log('home is pressed');
                break;
            case 'CommandOrControl+Shift+PageDown':
                console.log('home is pressed');
                break;
            case 'CommandOrControl+Shift+Insert':
                console.log('home is pressed');
                break;
            default:
                console.log(shortcut + ' is pressed');
                break;
        }
    }
}