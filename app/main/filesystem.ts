const fs = require('fs');

const {app} = require('electron');

class Filesystem {
    public static getDir() {
        var rootDir = app.getAppPath();
        var dir = rootDir + '/WORKLOG/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        return dir;
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
