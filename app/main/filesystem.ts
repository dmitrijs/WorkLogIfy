import {app} from "electron";
import fs from "fs";
import moment from "moment";

class Filesystem {
    public static getDir() {
        var rootDir = app.getPath('appData');
        var dir = rootDir + (app.isPackaged ? '/WorkLogIfy/' : '/WorkLogIfy-test/');

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        return dir;
    }

    public static getWorkLog(day_key) {
        const dir = this.getDir();
        let worklog = []; // should be empty

        if (fs.existsSync(dir + '/worklog-' + day_key + '.json')) {
            let contents = fs.readFileSync(dir + '/worklog-' + day_key + '.json', 'utf8');
            worklog = JSON.parse(contents);
            (<any>worklog).activeApps = [];

            if (fs.existsSync(dir + '/worklog-' + day_key + '-activeApps.json')) {
                let contents = fs.readFileSync(dir + '/worklog-' + day_key + '-activeApps.json', 'utf8');
                let activeAppsFile = JSON.parse(contents);
                let activeApps = [];
                if (activeAppsFile && activeAppsFile.activeApps) {
                    activeApps = activeAppsFile.activeApps;
                }
                (<any>worklog).activeApps = activeApps;
            }
        }

        return worklog;
    }

    public static getSettings() {
        const dir = this.getDir();

        if (fs.existsSync(dir + '/settings.json')) {
            let contents = fs.readFileSync(dir + '/settings.json', 'utf8');
            return JSON.parse(contents);
        }

        return {};
    }

    public static saveWorkLog(day_key, worklog, worklogProcessed, settings) {
        const dir = this.getDir();
        console.log("files directory: " + dir);
        delete worklog.activeApps;
        fs.writeFileSync(dir + '/worklog-' + day_key + '.json', JSON.stringify({
            version: 1,
            tasks: worklog,
        }, null, 2));
        fs.writeFileSync(dir + '/backup_worklog-' + day_key + '.' + (moment().format('HH')) + 'h.json', JSON.stringify({
            version: 1,
            tasks: worklog,
        }, null, 2));
        fs.writeFileSync(dir + '/settings.json', JSON.stringify(settings, null, 2));

        {
            let time_charge_rounded_seconds = 0;
            for (let group of Object.values(worklogProcessed)) {
                time_charge_rounded_seconds += (<any>group).time_charge_rounded_seconds;
            }
            console.log('worklog_totals: sum for', day_key, 'is', time_charge_rounded_seconds);

            let contents = this.getFileTotals();
            let day = contents[day_key] || {
                time_charge_rounded_seconds: 0,
            };
            day.time_charge_rounded_seconds = time_charge_rounded_seconds;
            contents[day_key] = day;
            fs.writeFileSync(dir + '/worklog_totals.json', JSON.stringify(contents, null, 2));
        }
    }

    public static saveActiveApps(day_key, activeApps) {
        const dir = this.getDir();
        fs.writeFileSync(dir + '/worklog-' + day_key + '-activeApps.json', JSON.stringify({
            version: 1,
            activeApps: activeApps,
        }, null, 2));
    }

    public static getFileTotals() {
        const dir = this.getDir();

        let contents = {};
        if (fs.existsSync(dir + '/worklog_totals.json')) {
            contents = JSON.parse(fs.readFileSync(dir + '/worklog_totals.json').toString());
            contents = contents || {};
        }
        return contents;
    }

    public static saveTaskTemplates(taskTemplates) {
        const dir = this.getDir();
        fs.writeFileSync(dir + '/worklog_templates.json', JSON.stringify(taskTemplates));
    }

    public static getTaskTemplates() {
        const dir = this.getDir();

        let contents = [];
        if (fs.existsSync(dir + '/worklog_templates.json')) {
            contents = JSON.parse(fs.readFileSync(dir + '/worklog_templates.json').toString());
            contents = contents || [];
        }
        return contents;
    }
}

export default Filesystem;
