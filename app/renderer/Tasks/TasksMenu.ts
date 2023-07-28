import store from "../Store/Store";
import {timespanToText} from "../Utils/Utils";
import _ from "lodash";
import moment from "moment";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const JIRA_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export default function createMenu() {
    let task = null;
    if (store.state.tasksSelectedIds.size === 1) {
        let taskId = store.state.tasksSelectedIds.keySeq().first();
        task = store.state.tasks.get(taskId);
    }

    console.log('task', task);
    console.log('task && task.get(\'code\')', (task && task.get('code')));

    const menu = new Menu();
    menu.append(new MenuItem({
        label: 'New Task', click() {
            store.setScreen('task.new');
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!(task && task.get('code'))),
        label: 'Copy the ID', click() {
            navigator.clipboard.writeText(task.get('code')).then(function () {
            }, function () {
                /* clipboard write failed */
            });
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!(task && task.get('code'))),
        label: 'View in JIRA', click() {
            let url = 'https://' + store.state.settings.jira_host + '/browse/' + task.get('code');
            window.open(url);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!(task && task.get('code') && task.get('chargeable') && !task.get('distributed'))),
        label: 'Record to JIRA', click() {
            let sum = task.get('sessions', []).reduce((sum, obj) => sum + obj.spent_seconds, 0);
            let recorded = task.get('records', []).reduce((sum, obj) => sum + obj.recorded_seconds, 0);
            let step = 6 * 60;

            sum -= recorded;

            if (sum < step) {
                alert('Time to record is too little. At least ' + timespanToText(step) + ' are required.');
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
                url: 'https://' + store.state.settings.jira_host + '/rest/api/2/issue/' + taskCode + '/worklog?notifyUsers=false&adjustEstimate=auto',
                auth: {
                    user: store.state.settings.jira_username,
                    pass: store.state.settings.jira_password,
                },
                method: 'POST',
                json: true,
                body: {
                    started: workLogTime,
                    timeSpentSeconds: timeSpentSeconds,
                },
            };
            let jiraResponseWorkLog;
            if (store.state.is_debug) {
                alert('Would be sent to JIRA: ' + timespanToText(timeSpentSeconds) + ' at ' + workLogTime);
                jiraResponseWorkLog = {response: {}};
            } else {
                jiraResponseWorkLog = window.ipc.sendSync('jira.request', _.cloneDeep(options));
            }

            if (jiraResponseWorkLog.error) {
                alert(jiraResponseWorkLog.error);
            } else {
                store.taskAddRecordedSeconds([task.get('id'), timeSpentSeconds, (jiraResponseWorkLog.response.id || null)]);
                store.updateTask([task.get('id'), 'is_done', true])
            }
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!task),
        label: 'Copy', click() {
            store.clipboardCopy(task.get('id'));
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!task),
        label: 'Cut', click() {
            store.clipboardCut(task.get('id'));
        },
    }));
    menu.append(new MenuItem({
        enabled: !!store.state.taskInClipboard,
        label: 'Paste', click() {
            store.clipboardPaste();
        },
    }));

    menu.addListener('menu-will-close', function () {
        store.deselectAll();
    });

    return menu;
}
