const fs = require('fs');

const {app} = require('electron');

class Filesystem {
    public static getWorkLog() {
        var documentsPath = app.getPath('documents');

        let contents = fs.readFileSync(documentsPath + '/worklog.json', 'utf8');

        let worklog = JSON.parse(contents);
        return worklog;
    }

    public static saveWorkLog(worklog) {
        var documentsPath = app.getPath('documents');

        fs.writeFileSync(documentsPath + '/worklog.json', JSON.stringify(worklog));
    }
}

export default Filesystem;
