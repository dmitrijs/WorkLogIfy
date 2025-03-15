import React from 'react';
import store from './Store/Store';
// import ActiveAppsWindow from './Tasks/ActiveAppsWindow';
// import CalendarWindow from './Tasks/CalendarWindow';
// import SettingsWindow from './Tasks/SettingsWindow';
// import TaskEdit from './Tasks/TaskEdit';
import TasksWindow from './Tasks/TasksWindow';
// import TemplatesWindow from './Tasks/TemplatesWindow';
// import TodosWindow from './Tasks/TodosWindow';
// import timer from './Timer';
import MainMenu from './MainMenu';
import timer from "./Timer";

const App = () => {
    const tasksGrouped = store.getTasksGrouped;

    const save = () => {
        store.saveTasks();
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

    return (
        <div className={`App ${store.state.is_debug ? 'isDebug' : ''}`}>
            <div className="AppScreen">
                <MainMenu />
                <React.Fragment>
                    {store.state.screen === 'tasks' && <TasksWindow />}
                    {/*{store.state.screen === 'task.edit' && <TaskEdit mode="edit" key="task.edit" />}*/}
                    {/*{store.state.screen === 'task.new' && <TaskEdit mode="new" key="task.new" />}*/}
                    {/*{store.state.screen === 'todo' && <TodosWindow key="todo" />}*/}
                    {/*{store.state.screen === 'calendar' && <CalendarWindow />}*/}
                    {/*{store.state.screen === 'task.templates' && <TemplatesWindow />}*/}
                    {/*{store.state.screen === 'settings' && <SettingsWindow />}*/}
                    {/*{store.state.screen === 'active_apps' && <ActiveAppsWindow />}*/}
                </React.Fragment>
            </div>

            {store.state.is_debug && (
                <div className="Debug">
                    <button onClick={() => document.location.reload()} className="btn btn-secondary" style={{ padding: '10px 20px', float: 'right' }}>reload</button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={save}>save</button>
                    {Object.entries(store.state).map(([key, value]) => !value || typeof value !== 'object' ? (
                        <div key={key}><strong>{key}:</strong> {value || ''}</div>
                    ) : null)}
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
                    {Object.entries(tasksGrouped).map(([dayId, day]) => (
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
                    ))}
                </div>
            )}
        </div>
    );
};

export default App;