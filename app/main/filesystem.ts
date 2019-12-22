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

    public static saveWorkLog(day_key, worklog, worklogProcessed) {
        const dir = this.getDir();
        fs.writeFileSync(dir + '/worklog-' + day_key + '.json', JSON.stringify(worklog));

        {
            if (!worklogProcessed[day_key]) {
                console.log('worklog_totals: no records for day', day_key);
                return;
            }

            let contents = this.getFileTotals();
            let day = contents[day_key] || {
                time_charge_rounded_seconds: 0,
            };
            day.time_charge_rounded_seconds = worklogProcessed[day_key].time_charge_rounded_seconds;
            contents[day_key] = day;
            fs.writeFileSync(dir + '/worklog_totals.json', JSON.stringify(contents));
        }
    }

    public static getFileTotals() {
        const dir = this.getDir();

        let contents = {};
        if (fs.existsSync(dir + '/worklog_totals.json')) {
            contents = JSON.parse(fs.readFileSync(dir + '/worklog_totals.json'));
            contents = contents || {};
        }
        return contents;
    }
}

export default Filesystem;
