const fs = require('fs');

const {app} = require('electron');

class Filesystem {
    public static getWorkLog() {
        var rootDir = app.getAppPath();
        var dir = rootDir + '/WORKLOG/';

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        let worklog = [];

        if (fs.existsSync(dir + '/worklog.json')) {
            let contents = fs.readFileSync(dir + '/worklog.json', 'utf8');
            worklog = JSON.parse(contents);
        }

        return worklog;
    }

    public static saveWorkLog(worklog) {
        var documentsPath = app.getPath('documents');

        fs.writeFileSync(documentsPath + '/worklog.json', JSON.stringify(worklog));
    }
}

export default Filesystem;
