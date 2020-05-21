import store from "../Store/Store";
import {timespanToText} from "../Utils/Utils";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const moment = require("moment");

const JIRA_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export default function createMenu() {
    const menu = new Menu();
    menu.append(new MenuItem({
        enabled: (store.state.tasksSelectedIds.size === 1),
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
        enabled: (store.state.tasksSelectedIds.size === 1),
        label: 'Record to JIRA', click() {
            if (store.state.tasksSelectedIds.size !== 1) {
                return;
            }

            let taskId = store.state.tasksSelectedIds.keySeq().first();
            let task = store.state.tasks.get(taskId);

            if (task && task.get('code') && task.get('chargeable') && !task.get('distributed')) {
                let sum = task.get('sessions', []).reduce((sum, obj) => sum + obj.spent_seconds, 0);
                let recorded = task.get('records', []).reduce((sum, obj) => sum + obj.recorded_seconds, 0);
                let step = 6 * 60;

                sum -= recorded;

                if (sum < step) {
                    return;
                }

                let timeSpentSeconds = Math.ceil(sum / step) * step; // round up

                let taskCode = task.get('code');
                let timeStarted = moment(task.get('sessions').get(0).started_at)
                let taskDate = moment(task.get('date'), 'YYYY-MM-DD');
                if (taskDate.format('YYYY-MM-DD') === task.get('date')) { // valid date
                    timeStarted.year(taskDate.year());
                    timeStarted.month(taskDate.month());
                    timeStarted.date(taskDate.date());
                }
                let workLogTime = timeStarted.format(JIRA_TIME_FORMAT);

                let options = {
                    url: 'https://' + store.state.settings.get('jira_host') + '/rest/api/2/issue/' + taskCode + '/worklog?notifyUsers=false&adjustEstimate=auto',
                    auth: {
                        user: store.state.settings.get('jira_username'),
                        pass: store.state.settings.get('jira_password'),
                    },
                    method: 'POST',
                    json: true,
                    body: {
                        started: workLogTime,
                        timeSpentSeconds: timeSpentSeconds,
                    },
                };
                let jiraResponse;
                if (store.state.is_debug) {
                    alert('Would be sent to JIRA: ' + timespanToText(timeSpentSeconds) + ' at ' + workLogTime);
                    jiraResponse = 'success';
                } else {
                    jiraResponse = window.ipc.sendSync('jira.request', options);
                }

                if (jiraResponse === 'success') {
                    store.commit.taskAddRecordedSeconds([taskId, timeSpentSeconds]);
                    store.commit.updateTask([taskId, 'is_done', true])
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
        enabled: (store.state.tasksSelectedIds.size > 0),
        label: 'Delete', click() {
            store.commit.deleteSelected();
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (store.state.tasksSelectedIds.size === 1),
        label: 'Copy tasks', click() {
            store.commit.clipboardCopySelected();
        },
    }));
    menu.append(new MenuItem({
        enabled: (store.state.tasksSelectedIds.size === 1),
        label: 'Cut tasks', click() {
            store.commit.clipboardCutSelected();
        },
    }));
    menu.append(new MenuItem({
        enabled: !!store.state.taskInClipboard,
        label: 'Paste tasks', click() {
            store.commit.clipboardPaste();
        },
    }));

    return menu;
}
