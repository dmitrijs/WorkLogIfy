import {cn} from "@/lib/utils";
import React, {useCallback} from 'react';
import LineChart from '../Components/LineChart';
import {useStoreContext} from '../Store/Store';
import timer from "../Timer";
import {timespanToText} from '../Utils/Utils';

const TaskRow = ({tasksGrouped, group_id, task_id, onDragStart}: any) => {
    const task: TaskObj = tasksGrouped[group_id]?.tasks[task_id] || {code: 'ERROR!', title: `Invalid task id '${task_id}' in group '${group_id}'`};
    const rootTasks: any[] = Object.values(tasksGrouped).flatMap((group: any) => Object.values(group.tasks)).filter((t: any) => t.code !== 'idle' && !t.parentId);
    const store = useStoreContext();

    const editTask = useCallback((event) => {
        store.taskEdit(task.id);
    }, [task.id]);

    const startTimer = useCallback((event) => {
        timer.start(task.id);
    }, [task.id]);

    const stopTimer = useCallback(() => {
        timer.stop();
    }, []);

    const copyToClipboard = useCallback((event, text) => {
        navigator.clipboard.writeText(text).then(() => {
            event.target.classList.add('AnimationPulseOnceAndHide');
        });
    }, []);

    const dropTime = useCallback((event) => {
        store.dropTime(event, task.id);
    }, [store.state, task.id]);

    return (
        <div
            className={cn([
                "TRow",
                task.distributed && 'distributed',
                !task.chargeable && 'notchargeable',
                store.state.tasksHoveredId === task.id && 'hovered',
                store.state.taskTimeredId === task.id && 'timered',
                task.time_recorded_seconds && 'hasRecords',
                task.is_done && 'isDone',
                task.is_on_hold && 'isOnHold',
                rootTasks[task.code || task.id]?.id === task.id && 'isRootTask',
                task.parentId && 'isSubtask',
                task.parentId && store.parentIsMissing(task) && 'isMissingParent',
                task.id === store.state.drag.taskFrom && 'isDragFrom',
            ])}
        >
            <div className="TRowContent" style={{display: (store.state.tasksHideUnReportable && (task.distributed || !task.chargeable)) && store.state.taskTimeredId !== task.id ? 'none' : ''}}
                 onMouseEnter={() => store.tasksUiHoveredId(task.id)}
                 onMouseLeave={() => store.tasksUiUnhoveredId(task.id)}
            >
                <div className="TCol --hierarchy">
                    {!task.parentId ? (
                        task.subtaskIds?.length ? <i className="icofont-rounded-down"></i> : <i className="icofont-rounded-right" style={{color: '#ababab'}}></i>
                    ) : null}
                </div>
                <div className="TCol --chargeable">
                    <i className={`IconAsInput icofont-not-allowed ${!task.chargeable ? 'active' : ''}`} onClick={() => store.updateTask([task.id, 'chargeable', !task.chargeable])}></i>
                </div>
                <div className="TCol --distributed">
                    <i className={`IconAsInput icofont-exchange ${task.distributed ? 'active' : ''}`} onClick={() => store.updateTask([task.id, 'distributed', !task.distributed])}></i>
                </div>
                <div className="TCol --frozen">
                    <i className={`IconAsInput icofont-unlock ${task.frozen ? 'active' : ''}`} onClick={() => store.updateTask([task.id, 'frozen', !task.frozen])}></i>
                </div>
                <div className="TCol --code" onClick={() => store.state.tasksShowAsReport ? copyToClipboard(event, task.code) : editTask(event)}>
                    <span style={{color: rootTasks[task.code] ? '#acacac' : 'inherit'}}>{task.code}</span>
                    <div className="--edit-button">
                        {!task.grouped && <a href="#" onClick={(e) => {
                            e.stopPropagation();
                            editTask(e);
                        }}>edit</a>}
                    </div>
                </div>
                <div className="TCol --title" onClick={() => store.state.tasksShowAsReport ? copyToClipboard(event, task.notes) : editTask(event)}>
                    {(!task.parentId || task.title) && <span className={`Title--Content ${!store.state.tasksShowAsReport && !store.state.tasksHideUnReportable ? 'ellipsis' : ''}`}>
                        {task.code !== 'idle' && !task.asanaTaskGid && !rootTasks[task.code]?.asanaTaskGid && !task.youtrackTaskCode && !task.parentId ? '❔' : null}
                        {task.title || '\u00A0'}
                    </span>}
                    <span className="Note--Content">
                        {store.state.tasksShowAsReport && !task.notes ? '[empty notes]' : task.notes || '\u00A0'}
                    </span>
                    {task.comment && <span className="Comment--Content">{task.comment || '\u00A0'}</span>}
                </div>
                <div className="TCol --status">
                    <i className={`IconAsInput IconDone icofont-ui-check ${task.is_done ? 'active' : ''}`} onClick={() => store.updateTask([task.id, 'is_done', !task.is_done])}></i>
                    <i className={`IconAsInput IconOnHold icofont-sand-clock ${task.is_on_hold ? 'active' : ''}`} onClick={() => store.updateTask([task.id, 'is_on_hold', !task.is_on_hold])}></i>
                </div>
                <div className="TCol --timespan" onClick={(event) => dropTime(event, task)} onMouseDown={(event) => {
                    event.preventDefault();
                    onDragStart(event, task);
                }} title={`Final charge: ${task.time_charge_text}\nRecorded: ${task.time_recorded_text}\nNot recorded: ${task.time_unrecorded_text}`}>
                    <span className="--timespan-spent">
                        {store.state.taskTimeredId === task.id ? <div>{timespanToText(store.state.timerElapsedSeconds)}</div> : null}
                        {task.id === store.state.drag.taskFrom && store.state.drag.minutes > 1 && '⇩ '}
                        {store.state.taskTimeredId === task.id && <span style={{display: 'inline'}}>&sum; </span>}
                        {task.time_spent_text}
                    </span>
                    {task.time_recorded_seconds > 0 && <span className="--timespan-charge">{task.time_unrecorded_text}</span>}
                    <span className="--timespan-final-charge">{task.time_charge_text}</span>
                    <LineChart className="ChartRecorded bg-dark" height={3} total={task.time_charge_seconds} progress_success={task.time_recorded_seconds}/>
                    <LineChart className="ChartSpent bg-warning" height={3} total={task.time_charge_seconds} progress_normal={task.time_spent_seconds}/>
                </div>
                <div className="TCol --playback">
                    {store.state.taskTimeredId === task.id && <i className={"IconAsInput icofont-square " + (task.is_done || task.is_on_hold ? 'hidden' : '')} onClick={stopTimer}></i>}
                    {store.state.taskTimeredId !== task.id && <i className={"IconAsInput icofont-play " + (task.is_done || task.is_on_hold ? 'hidden' : '')} onClick={(event) => startTimer(event, task)}></i>}
                    {task.is_done && <i className="IconAsInput IconDone IconStatus icofont-ui-check active"></i>}
                    {task.is_on_hold && <i className="IconAsInput IconOnHold IconStatus icofont-sand-clock active"></i>}
                </div>
            </div>

            <div className="Subtasks">
                {Object.values(task.subtaskIds || []).map(subtask_id => (
                    <TaskRow
                        key={subtask_id}
                        group_id={group_id}
                        task_id={subtask_id}
                        tasksGrouped={tasksGrouped}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    );
};

export default TaskRow;
