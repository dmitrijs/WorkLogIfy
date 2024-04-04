import store from "../Store/Store";
import {timespanToText} from "../Utils/Utils";
import _ from "lodash";
import moment from "moment";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const JIRA_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

export default function createMenu() {
    let task = null;
    if (Object.values(store.state.tasksSelectedIds).length === 1) {
        let taskId = Object.keys(store.state.tasksSelectedIds)[0];
        task = store.state.tasks[taskId];
    }

    const menu = new Menu();
    menu.append(new MenuItem({
        label: 'New Task', click() {
            store.state.taskLastSelected = null;
            store.setScreen('task.new');
        },
    }));
    menu.append(new MenuItem({
        label: 'New Follow-up Task', click() {
            store.setScreen('task.new');
        },
    }));
    menu.append(new MenuItem({
        label: 'Extract As New Task', click() {
            store.state.taskIsExtracting = true;
            store.setScreen('task.new');
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!(task && task.code)),
        label: 'Copy the ID', click() {
            navigator.clipboard.writeText(task.code).then(function () {
            }, function () {
                /* clipboard write failed */
            });
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!(task && task.code)),
        label: 'View in JIRA', click() {
            let url = 'https://' + store.state.settings.jira_host + '/browse/' + task.code;
            window.open(url);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!(task && task.code && task.chargeable && !task.distributed)),
        label: 'Record to JIRA', click() {
            let sum = task.sessions.reduce((sum, obj) => sum + obj.spent_seconds, 0);
            let recorded = task.records.reduce((sum, obj) => sum + obj.recorded_seconds, 0);
            let step = 6 * 60;

            sum -= recorded;

            if (sum < step) {
                alert('Time to record is too little. At least ' + timespanToText(step) + ' are required.');
                return;
            }

            let timeSpentSeconds = Math.ceil(sum / step) * step; // round up

            let taskCode = task.code;
            let timeStarted = moment(task.sessions[0].started_at)
            let taskDate = moment(task.date, 'YYYY-MM-DD');
            if (taskDate.format('YYYY-MM-DD') === task.date) { // valid date
                timeStarted.year(taskDate.year());
                timeStarted.month(taskDate.month());
                timeStarted.date(taskDate.date());
            }
            let workLogTime = timeStarted.format(JIRA_TIME_FORMAT);

            // TODO: `request-promise` was replaced with `fetch`, these options were not adjusted
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
                jiraResponseWorkLog = window.ipc.sendSync('jira.request', <any>_.cloneDeep(options));
            }

            if (jiraResponseWorkLog.error) {
                alert(jiraResponseWorkLog.error);
            } else {
                store.taskAddRecordedSeconds([task.id, timeSpentSeconds, (jiraResponseWorkLog.response.id || null)]);
                store.updateTask([task.id, 'is_done', true])
            }
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!task),
        label: 'Copy', click() {
            store.clipboardCopy(task.id);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!task),
        label: 'Cut', click() {
            store.clipboardCut(task.id);
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
