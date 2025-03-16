import {cloneDeep} from "lodash";
import moment from "moment";
import React, {useEffect} from 'react';
import MainMenu from './MainMenu';
import {useStoreContext} from './Store/Store';
import ActiveAppsWindow from "./Tasks/ActiveAppsWindow";
import CalendarWindow from "./Tasks/CalendarWindow";
import SettingsWindow from "./Tasks/SettingsWindow";
import TaskEdit from "./Tasks/TaskEdit";
import TasksWindow from './Tasks/TasksWindow';
import TemplatesWindow from "./Tasks/TemplatesWindow";
import TodosWindow from "./Tasks/TodosWindow";
import timer from "./Timer";
import {timespanToText} from "./Utils/Utils";

const JIRA_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';

const App = () => {
    const store = useStoreContext();
    (window as any).storeGlobal = store;

    const save = () => {
        store.saveTasks(store, store)
    };

    const lock = () => {
        window.ipc.send('integrations.lock');
    };

    const wakeup = () => {
        window.ipc.send('integrations.wakeup');
    };

    const timerStop = () => {
        timer.stop();
    };

    const progressBar = (params) => {
        window.ipc.send('set.progress', params);
    };

    useEffect(() => {
        window.ipc.on('change.screen', ($event, where) => {
            store.setScreen(where);
        });

        window.ipc.on('debug.toggle', ($event, value) => {
            store.toggleDebug(value);
        });

        window.ipc.on('migration', ($event, what) => {
            if (what === 'export') {
                navigator.clipboard.writeText(JSON.stringify(store.state.tasks)).then(() => {
                }, () => {
                    /* clipboard write failed */
                });
            }
            if (what === 'import') {
                navigator.clipboard.readText().then((text) => {
                    store.setDayFromJson(text);
                });
            }
        });


        window.ipc.on('user-is-idle', (event: Electron.IpcRendererEvent, secondsIdle) => {
            if (timer.isActive()) {
                let timeredTask = store.state.tasks[store.state.taskTimeredId];
                if (timeredTask && timeredTask.code === 'idle') {
                    return; // already idle
                }
                timer.stop(secondsIdle);

                let idleTask = {...store.getEmptyTask()};
                idleTask.code = 'idle';
                idleTask.time_add_idle_seconds = secondsIdle;
                idleTask.time_add_minutes = '';
                idleTask.time_record_minutes = '';
                store.createTask(idleTask);

                timer.start(store.state.createdTaskId);
                window.ipc.send('flash.frame');
            }
        });

        window.ipc.on('user-active-app', (event: Electron.IpcRendererEvent, activeApp) => {
            if (timer.isActive()) {
                let timeredTask = store.state.tasks[store.state.taskTimeredId];
                console.log("[timeredTask.id, activeAppDescription]", [timeredTask.id, activeApp.appDescription]);
                store.taskAddActiveApp([timeredTask.id, activeApp.appDescription, activeApp.secondsIdle]);
            }
            store.addGlobalActiveApp(store.state.taskTimeredId, activeApp.appDescription, activeApp.secondsIdle);
        });

        window.ipc.on('timer-stop', (event: Electron.IpcRendererEvent) => {
            if (timer.isActive()) {
                timer.stop();
            }
        });

        window.ipc.on('confirm-app-quit', (event: Electron.IpcRendererEvent) => {
            if (timer.isActive()) {
                timer.stop();
            }
            window.ipc.send('quit.confirmed');
        });

        window.ipc.on('tasks-menu-command', (e, params) => {
            console.log('tasks-menu-command', params);

            const task = (params.taskId ? store.state.tasks[params.taskId] : null);

            switch (params.command) {
                case 'New Task':
                    store.setScreen('task.new');
                    break;
                case 'Extract Task':
                    store.state.creatingByExtract = true;
                    store.setScreen('task.new');
                    break;
                case 'New Subtask':
                    store.state.creatingSubtask = true;
                    store.setScreen('task.new');
                    break;
                case 'Extract Subtask':
                    store.state.creatingSubtask = true;
                    store.state.creatingByExtract = true;
                    store.setScreen('task.new');
                    break;
                case 'Copy the ID':
                    navigator.clipboard.writeText(task.code).then(function () {
                    }, function () {
                        /* clipboard write failed */
                    });
                    break;
                case 'View in JIRA': {
                    const url = 'https://' + store.state.settings.jira_host + '/browse/' + task.code;
                    window.open(url);
                    break;
                }
                case 'Record to JIRA': {
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
                        jiraResponseWorkLog = window.ipc.sendSync('jira.request', cloneDeep(options) as any);
                    }

                    if (jiraResponseWorkLog.error) {
                        alert(jiraResponseWorkLog.error);
                    } else {
                        store.taskAddRecordedSeconds([task.id, timeSpentSeconds, (jiraResponseWorkLog.response.id || null)]);
                        store.updateTask([task.id, 'is_done', true])
                    }
                    break;
                }
                case 'Copy':
                    store.clipboardCopy(task.id);
                    break;
                case 'Cut':
                    store.clipboardCut(task.id);
                    break;
                case 'Paste':
                    store.clipboardPaste();
                    break;
            }
        })

        window.ipc.on('calendar-menu-command', (e, {dayCode, dayType}) => {
            console.log('calendar-menu-command', {dayCode, dayType});

            let settings = store.state.settings;
            settings.special_days = settings.special_days || {};
            if (dayType) {
                settings.special_days[dayCode] = dayType;
            } else {
                delete settings.special_days[dayCode];
            }
            store.updateSettings(settings, false);
        })

        return () => {
            window.ipc.removeAllListeners();
        }
    }, [store.state]);

    return (
        <div className={`App ${store.state.is_debug ? 'isDebug' : ''}`}>
            <div className="AppScreen">
                <MainMenu/>
                <React.Fragment>
                    {store.state.screen === 'tasks' && <TasksWindow/>}
                    {store.state.screen === 'task.edit' && <TaskEdit mode="edit"/>}
                    {store.state.screen === 'task.new' && <TaskEdit mode="new"/>}
                    {store.state.screen === 'todo' && <TodosWindow/>}
                    {store.state.screen === 'calendar' && <CalendarWindow weekKey={null}/>}
                    {store.state.screen === 'task.templates' && <TemplatesWindow/>}
                    {store.state.screen === 'settings' && <SettingsWindow/>}
                    {store.state.screen === 'active_apps' && <ActiveAppsWindow/>}
                </React.Fragment>
            </div>

            {store.state.is_debug && (
                <div className="Debug">
                    <button onClick={() => document.location.reload()} className="btn btn-secondary" style={{padding: '10px 20px', float: 'right'}}>reload</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={save}>save</button>
                    {Object.entries(store.state).map(([key, value]) => (key === 'settings' || key === 'fileTotals' || key === 'tasks' || key === 'activeApps' ? null :
                            <div key={key}><strong>{key}:</strong> {(!value || typeof value === 'object') ? JSON.stringify(value) : value}</div>
                    ))}
                    <hr/>
                    Integrations:
                    <button type="button" className="btn btn-secondary btn-xs" onClick={lock}>lock</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={wakeup}>wake up</button>
                    <br/>
                    Timer:
                    <button type="button" className="btn btn-secondary btn-xs" onClick={timerStop} disabled={!store.state.taskTimeredId}>stop</button>
                    <hr/>
                    Progress:
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({indeterminate: true})}>∞</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({indeterminate: false})}>-</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({progress: 0.01})}>1%</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({progress: 0.70})}>70%</button>
                    <hr/>
                    {/*{Object.entries(tasksGrouped).map(([dayId, day]) => (
                        <div key={dayId}>
                            <strong>{dayId}</strong><br />
                            {Object.entries(day).map(([prop, val]) => (
                                <div key={prop}>
                                    {Array.isArray(val) && prop === 'tasks' ? (
                                        val.map(task => (
                                            <div key={task.id} style={{ paddingLeft: '10px' }}>
                                                <strong>{task.id}</strong>
                                                <div style={{ whiteSpace: 'pre' }}>{JSON.stringify(task)}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <div><em>{prop}</em>: {val || ''}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}*/}
                </div>
            )}
        </div>
    );
};

export default App;
