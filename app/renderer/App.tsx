import React, {useContext, useEffect} from 'react';
import store, {useStoreContext} from './Store/Store';
import ActiveAppsWindow from "./Tasks/ActiveAppsWindow";
import CalendarWindow from "./Tasks/CalendarWindow";
import SettingsWindow from "./Tasks/SettingsWindow";
import TaskEdit from "./Tasks/TaskEdit";
// import ActiveAppsWindow from './Tasks/ActiveAppsWindow';
// import CalendarWindow from './Tasks/CalendarWindow';
// import SettingsWindow from './Tasks/SettingsWindow';
// import TaskEdit from './Tasks/TaskEdit';
import TasksWindow from './Tasks/TasksWindow';
// import TemplatesWindow from './Tasks/TemplatesWindow';
// import TodosWindow from './Tasks/TodosWindow';
// import timer from './Timer';
import MainMenu from './MainMenu';
import TemplatesWindow from "./Tasks/TemplatesWindow";
import TodosWindow from "./Tasks/TodosWindow";
import timer from "./Timer";

const App = () => {
    // const tasksGrouped = store.getTasksGrouped();

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

        return () => {
            window.ipc.removeAllListeners();
        }
    }, [store]);

    return (
        <div className={`App ${store.state.is_debug ? 'isDebug' : ''}`}>
            <div className="AppScreen">
                <MainMenu />
                <React.Fragment>
                    {store.state.screen === 'tasks' && <TasksWindow />}
                    {store.state.screen === 'task.edit' && <TaskEdit mode="edit" />}
                    {store.state.screen === 'task.new' && <TaskEdit mode="new" />}
                    {store.state.screen === 'todo' && <TodosWindow />}
                    {store.state.screen === 'calendar' && <CalendarWindow />}
                    {store.state.screen === 'task.templates' && <TemplatesWindow />}
                    {store.state.screen === 'settings' && <SettingsWindow />}
                    {store.state.screen === 'active_apps' && <ActiveAppsWindow />}
                </React.Fragment>
            </div>

            {store.state.is_debug && (
                <div className="Debug">
                    <button onClick={() => document.location.reload()} className="btn btn-secondary" style={{ padding: '10px 20px', float: 'right' }}>reload</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={save}>save</button>
                    {Object.entries(store.state).map(([key, value]) => (key === 'tasks' || key === 'activeApps' ? null :
                        <div key={key}><strong>{key}:</strong> {(!value || typeof value === 'object') ? JSON.stringify(value) : value}</div>
                    ))}
                    <hr />
                    Integrations:
                    <button type="button" className="btn btn-secondary btn-xs" onClick={lock}>lock</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={wakeup}>wake up</button><br />
                    Timer:
                    <button type="button" className="btn btn-secondary btn-xs" onClick={timerStop} disabled={!store.state.taskTimeredId}>stop</button>
                    <hr />
                    Progress:
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({ indeterminate: true })}>∞</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({ indeterminate: false })}>-</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({ progress: 0.01 })}>1%</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => progressBar({ progress: 0.70 })}>70%</button>
                    <hr />
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
