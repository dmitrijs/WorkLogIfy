import store from "../Store/Store";
import {timespanToText} from "../Utils/Utils";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const menu = new Menu();
const moment = require("moment");

const JIRA_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

menu.append(new MenuItem({
    label: 'View in JIRA', click() {
        if (store.state.tasksSelectedIds.size !== 1) {
            return;
        }

        let taskId = store.state.tasksSelectedIds.keySeq().first();
        let code = store.state.tasks.get(taskId).get('code');

        if (code) {
            let url = 'https://' + store.state.settings.get('jira_host') + '/browse/' + code;
            window.open(url);
        }

        store.commit.deselectAll();
    },
}));
menu.append(new MenuItem({
    label: 'Record to JIRA', click() {
        if (store.state.tasksSelectedIds.size !== 1) {
            return;
        }

        let taskId = store.state.tasksSelectedIds.keySeq().first();
        let task = store.state.tasks.get(taskId);

        if (task && task.get('code') && task.get('chargeable') && !task.get('distributed')) {
            let sum = task.get('sessions', []).reduce((sum, obj) => sum + obj.spent_seconds, 0);
            let recorded = task.get('records', []).reduce((sum, obj) => sum + obj.recorded_seconds, 0);
            let step = 10 * 60;

            sum -= recorded;

            if (sum < step) {
                return;
            }

            if (!task.get('frozen')) {
                sum *= 1.12; // add 12%
            }

            let timeSpentSeconds = Math.ceil(sum / step) * step; // round up

            let taskCode = task.get('code');
            let timeNow = moment().format(JIRA_TIME_FORMAT);

            let options = {
                url: 'https://' + store.state.settings.get('jira_host') + '/rest/api/2/issue/' + taskCode + '/worklog?notifyUsers=false&adjustEstimate=auto',
                auth: {
                    user: store.state.settings.get('jira_username'),
                    pass: store.state.settings.get('jira_password'),
                },
                method: 'POST',
                json: true,
                body: {
                    started: timeNow,
                    timeSpentSeconds: timeSpentSeconds,
                },
            };
            let jiraResponse;
            if (store.state.is_debug) {
                jiraResponse = 'Would be recorded: ' + timespanToText(timeSpentSeconds) + ' at ' + timeNow;
            } else {
                jiraResponse = window.ipc.sendSync('jira.request', options);
            }

            if (jiraResponse === 'success') {
                store.commit.taskAddRecordedSeconds([taskId, timeSpentSeconds]);
            } else {
                alert(jiraResponse);
            }
        }

        store.commit.deselectAll();
    },
}));
menu.append(new MenuItem({
    type: 'separator',
}));
menu.append(new MenuItem({
    label: 'Delete', click() {
        store.commit.deleteSelected();
    },
}));
menu.append(new MenuItem({
    type: 'separator',
}));
menu.append(new MenuItem({
    label: 'Copy tasks', click() {
        store.commit.clipboardCopySelected();
    },
}));
menu.append(new MenuItem({
    label: 'Cut tasks', click() {
        store.commit.clipboardCutSelected();
    },
}));
menu.append(new MenuItem({
    label: 'Paste tasks', click() {
        store.commit.clipboardPaste();
    },
}));

export default menu;
