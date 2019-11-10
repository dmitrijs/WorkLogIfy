const fs = require('fs');
var glob = require("glob");

const {app, dialog} = require('electron');

class Filesystem {
    public static getDir() {
        var rootDir = app.getPath('appData');
        var dir = rootDir + '/WorkLogIfy/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        return dir;
    }

    public static getAllFiles() {
        const dir = this.getDir();

        let files = glob.sync(dir + '/worklog-*.json');

        const result = [];
        for (let file of files) {
            let m = file.match(/\/worklog-([\d-]+)\.json$/);
            if (m) {
                result.push(m[1]);
            }
        }
        return result.sort().reverse();
    }

    public static getWorkLog(day_key) {
        const dir = this.getDir();
        let worklog = [];

        if (fs.existsSync(dir + '/worklog-' + day_key + '.json')) {
            let contents = fs.readFileSync(dir + '/worklog-' + day_key + '.json', 'utf8');
            worklog = JSON.parse(contents);
        }

        return worklog;
    }

    public static saveWorkLog(day_key, worklog) {
        const dir = this.getDir();
        fs.writeFileSync(dir + '/worklog-' + day_key + '.json', JSON.stringify(worklog));
    }
}

export default Filesystem;
