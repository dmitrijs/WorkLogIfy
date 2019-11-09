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

    public static getWorkLog() {
        const dir = this.getDir();
        let worklog = [];

        if (fs.existsSync(dir + '/worklog.json')) {
            let contents = fs.readFileSync(dir + '/worklog.json', 'utf8');
            worklog = JSON.parse(contents);
        }

        return worklog;
    }

    public static saveWorkLog(worklog) {
        const dir = this.getDir();
        fs.writeFileSync(dir + '/worklog.json', JSON.stringify(worklog));
    }
}

export default Filesystem;
