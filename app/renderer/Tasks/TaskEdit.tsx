import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useStoreContext} from '../Store/Store';
import { timespanToText } from '../Utils/Utils';
import timer from "../Timer";

const TaskEdit = ({ mode }) => {
    const [task, setTask] = useState({});
    const titleEl = useRef(null);
    const notesEl = useRef(null);
    const store = useStoreContext();

    useEffect(() => {
        if (mode === 'new') {
            setTask({ ...store.getEmptyTask() });
        } else {
            setTask({ ...store.getEditedTask(), time_add_minutes: '', time_record_minutes: '' });
        }
        titleEl.current.focus();
    }, [mode, store]);

    const save = (autostart = false) => {
        if (mode === 'edit') {
            store.saveTask(task);
        } else {
            store.createTask(task);
            if (autostart) {
                timer.start(store.state.createdTaskId);
            }
        }
    };

    const fill = (template) => {
        let forced = false;
        if (task.code === template.code) {
            forced = true;
        }
        const updatedTask = { ...task };
        if (template.title) {
            updatedTask.title = template.title;
        }
        if (template.code) {
            updatedTask.code = template.code;
        }
        updatedTask.frozen = !!template.frozen;
        updatedTask.chargeable = !!template.chargeable;
        updatedTask.distributed = !!template.distributed;
        if (!updatedTask.notes || forced) {
            updatedTask.notes = template.notes;
        }
        setTask(updatedTask);
        notesEl.current.focus();
    };

    const back = () => {
        store.returnToTasksScreen();
    };

    const formatSession = (sess) => {
        const timespan = timespanToText(sess.spent_seconds);
        return `[${sess.method}] ${moment(sess.started_at).format('HH:mm')} -> ${moment(sess.finished_at).format('HH:mm')} = ${timespan}`;
    };

    const formatRecord = (rec) => {
        const timespan = timespanToText(rec.recorded_seconds);
        return `<strong>${timespan}</strong> (${rec.method} at ${moment(rec.created_at).format('HH:mm')})`;
    };

    const formatActiveApp = (activeApp) => {
        return `[${moment(activeApp.noticed_at).format('HH:mm:ss')}] ${activeApp.description}`;
    };

    const codeChanged = () => {
        if (!task.code) {
            return;
        }
        const matches = task.code.match(/(?:https:\/\/)?[^.]+\.atlassian\.net\/browse\/(\S+-\d+).*?/);
        if (matches) {
            setTask({ ...task, code: matches[1] });
        }
    };

    const asanaTaskChanged = () => {
        if (!task.asanaTaskGid || !store.state.asanaTasks[task.asanaTaskGid]) {
            return;
        }
        const asanaTask = store.state.asanaTasks[task.asanaTaskGid];
        setTask({ ...task, title: asanaTask.name });
    };

    const asanaTasks = _.groupBy(store.state.asanaTasks, 'assignee_section.name');

    return (
        <div className="TaskEdit" data-mode={mode}>
            <br />
            <form className="TaskEditForm" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <table style={{ width: '100%' }}>
                    <tbody>
                    {mode !== 'edit' && (
                        <>
                            <tr>
                                <td>Templates:</td>
                                <td>
                                    <div className="TemplateTasks">
                                        {store.state.templates.map(template => (
                                            <div key={template.code} className="TemplateTask" onClick={() => fill(template)}>
                                                <strong>{template.code}</strong>&nbsp; "{template.title}"
                                                <div style={{ float: 'right' }}>
                                                    <i className={`IconAsInput icofont-not-allowed ${!template.chargeable ? 'active' : ''}`}></i>
                                                    <i className={`IconAsInput icofont-exchange ${template.distributed ? 'active' : ''}`}></i>
                                                    <i className={`IconAsInput icofont-unlock ${template.frozen ? 'active' : ''}`}></i>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <em>Click twice to overwrite non-empty fields.</em>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2">
                                    <hr style={{ marginBlock: '0.5rem' }} />
                                </td>
                            </tr>
                        </>
                    )}
                    <tr>
                        <td>Title:</td>
                        <td><input type="text" value={task.title || ''} onChange={(e) => setTask({ ...task, title: e.target.value })} ref={titleEl} /></td>
                    </tr>
                    <tr>
                        <td>Asana task (<a href="#" onClick={(e) => { e.preventDefault(); store.loadAsanaTasks(true); }}><i className="icofont-refresh"></i></a>):</td>
                        <td>
                            <select value={task.asanaTaskGid || ''} onChange={(e) => { setTask({ ...task, asanaTaskGid: e.target.value }); asanaTaskChanged(); }}>
                                <option value=""></option>
                                {!store.state.asanaTasks?.[task.asanaTaskGid] && <option value={task.asanaTaskGid}>Current: {task.asanaTaskGid}</option>}
                                {Object.entries(asanaTasks).map(([groupName, tasks]) => (
                                    <optgroup key={groupName} label={String(groupName)}>
                                        {tasks.map(task => (
                                            <option key={task.gid} value={task.gid}>{task.completed_at ? '[✓] ' : ''}{task.name}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: '100px' }}>Code:</td>
                        <td className="Complex">
                            <div style={{ marginRight: '11px' }}>
                                    <span>
                                        <input type="text" placeholder="TSKS-0000" value={task.code || ''} onChange={(e) => { setTask({ ...task, code: e.target.value }); codeChanged(); }} />
                                        <button
                                            className={`btn btn-xs ${task.code === 'idle' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                            type="button"
                                            style={{ padding: '1px 8px', display: 'block', float: 'right', position: 'relative', top: '1px' }}
                                            onClick={() => setTask({ ...task, code: 'idle' })}
                                        >idle</button>
                                    </span>
                                <span>From: <input type="text" className="narrow" value={task.source || ''} onChange={(e) => setTask({ ...task, source: e.target.value })} /></span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Report group:</td>
                        <td className="Complex">
                            <div>
                                <span><input type="text" placeholder={task.date} value={task.group_key || ''} onChange={(e) => setTask({ ...task, group_key: e.target.value })} /></span>
                                <span style={{ fontWeight: task.taskIdExtractedFrom ? 'bold' : '' }}>
                                        {task.taskIdExtractedFrom ? 'Extract' : 'Adjust'}:
                                        <input type="text" className="narrow" value={task.time_add_minutes || ''} onChange={(e) => setTask({ ...task, time_add_minutes: e.target.value })} />m
                                    </span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Date:</td>
                        <td className="Complex">
                            <div>
                                <span><input type="text" value={task.date || ''} onChange={(e) => setTask({ ...task, date: e.target.value })} /></span>
                                <span>Recorded: <input type="text" className="narrow" value={task.time_record_minutes || ''} onChange={(e) => setTask({ ...task, time_record_minutes: e.target.value })} />m</span>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Notes:</td>
                        <td><textarea ref={notesEl} value={task.notes || ''} onChange={(e) => setTask({ ...task, notes: e.target.value })} /></td>
                    </tr>
                    <tr>
                        <td>Comment:</td>
                        <td><input type="text" value={task.comment || ''} onChange={(e) => setTask({ ...task, comment: e.target.value })} /></td>
                    </tr>
                    <tr className={task.parentId && store.parentIsMissing(task) ? 'HasError' : ''}>
                        <td>Parent task:</td>
                        <td>
                            <select value={task.parentId || ''} onChange={(e) => setTask({ ...task, parentId: e.target.value })}>
                                <option value={null}></option>
                                {Object.values(store.state.tasks).map((parentTask:any) => (
                                    parentTask.id !== task.id && !parentTask.parentId && (
                                        <option key={parentTask.id} value={parentTask.id}>
                                            {parentTask.code && `[${parentTask.code}]`}
                                            {parentTask.title}
                                            {parentTask.notes && ` (${parentTask.notes})`}
                                        </option>
                                    )
                                ))}
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={back}>&lt; back</button>
                            <div className="btn-group float-right" role="group">
                                <i className={`TaskFlagIconAsInput icofont-not-allowed ${!task.chargeable ? 'active' : ''}`} onClick={() => setTask({ ...task, chargeable: !task.chargeable })}></i>
                                <i className={`TaskFlagIconAsInput icofont-exchange ${task.distributed ? 'active' : ''}`} onClick={() => setTask({ ...task, distributed: !task.distributed })}></i>
                                <i className={`TaskFlagIconAsInput icofont-unlock ${task.frozen ? 'active' : ''}`} onClick={() => setTask({ ...task, frozen: !task.frozen })}></i>
                                <button className={`btn btn-secondary btn-sm ${store.state.taskTimeredId === task.id ? 'btn-primary' : ''}`}>
                                    {mode === 'edit' ? 'update' : 'create'}
                                </button>
                                {mode !== 'edit' && (
                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => save(true)}>
                                        <i className="IconAsInput icofont-play"></i>
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Recorded:</strong></td>
                        <td>
                            {task.records?.length > 0 ? (
                                task.records.map(rec => (
                                    rec.jiraWorkLogId ? (
                                        <a
                                            key={rec.jiraWorkLogId}
                                            target="_blank"
                                            href={`https://${store.state.settings.jira_host}/browse/${task.code}?focusedWorklogId=${rec.jiraWorkLogId}`}
                                            dangerouslySetInnerHTML={{ __html: formatRecord(rec) }}
                                        />
                                    ) : (
                                        <span key={rec.created_at} dangerouslySetInnerHTML={{ __html: formatRecord(rec) }} />
                                    )
                                ))
                            ) : (
                                <div>none</div>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>Sessions:</td>
                        <td>
                            <div style={{ maxHeight: '100px', overflow: 'auto' }}>
                                {task.sessions?.length > 0 ? (
                                    task.sessions.map(sess => (
                                        <div key={sess.started_at}>{formatSession(sess)}</div>
                                    ))
                                ) : (
                                    <div>none</div>
                                )}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>Active apps:</td>
                        <td>
                            <div style={{ maxHeight: '100px', overflow: 'auto', maxWidth: '400px', whiteSpace: 'nowrap' }}>
                                {task.activeApps?.length > 0 ? (
                                    task.activeApps.map(activeApp => (
                                        <div key={activeApp.noticed_at}>{formatActiveApp(activeApp)}</div>
                                    ))
                                ) : (
                                    <div>none</div>
                                )}
                            </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
};

export default TaskEdit;
