import {cloneDeep, map} from 'lodash';
import moment from 'moment';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import LineChart from '../Components/LineChart';
import horizontalScroller from '../library/horizontal_scroller';
import {useStoreContext} from '../Store/Store';
import {Store_MergeSameCodes} from '../Store/Store_GetGroupedTasks';
import {timespanToText, timespanToTextHours} from '../Utils/Utils';
// import CalendarWindow from './CalendarWindow';
import TaskRow from './TaskRow';
import createMenu from './TasksMenu';

const TasksWindow = () => {
    const forceUpdateKey = useRef(1);
    const timeline = useRef(null);
    const globalNotesInput = useRef(null);
    const [total, setTotal] = useState({});
    const [tasksGrouped, setTasksGrouped] = useState<any>({});
    const [tasksGroupedAndMerged, setTasksGroupedAndMerged] = useState<any>({});
    const store = useStoreContext()

    const getTasksGrouped = useMemo(() => {
        return store.getTasksGrouped();
    }, []);

    useEffect(() => {
        horizontalScroller(timeline.current);
        adjustNotesHeight();

        const contextMenuShow = (e) => {
            store.selectHovered();
            e.preventDefault();
            createMenu(store).popup();
        };

        window.addEventListener('contextmenu', contextMenuShow, false);
        return () => {
            window.removeEventListener('contextmenu', contextMenuShow);
        };
    }, []);

    useEffect(() => {
        adjustNotesHeight();
    }, [store.state.settings.global_notes]);

    useEffect(() => {
        const computedTotal = computeTotal();
        setTotal(computedTotal);
    }, [tasksGrouped]);

    useEffect(() => {
        const groups = getTasksGrouped;
        let result = groups;
        if (store.state.tasksShowAsReport) {
            map(groups, (group, date) => {
                result[date].tasks = Store_MergeSameCodes(group.tasks);
            });
        }
        setTasksGrouped(result);
    }, [getTasksGrouped]);

    useEffect(() => {
        const groups = getTasksGrouped;
        let result = cloneDeep(groups);
        map(groups, (group, date) => {
            result[date].tasks = Store_MergeSameCodes(group.tasks);
        });
        setTasksGroupedAndMerged(result);
    }, [getTasksGrouped]);

    const computeTotal = () => {
        let total = {
            tasks: {},
            time_charge_rounded_seconds: 0,
            time_recorded_seconds: 0,
            time_spent_seconds: 0,
            time_distributed_seconds: 0,
            time_charge_rounded_text: '',
            time_recorded_text: '',
            time_spent_text: '',
            time_distributed_text: '',
            time_not_distributed_seconds: 0,
            time_charge_seconds: 0,
            time_charge_text: '',
            duplicatesExist: null,
        };
        for (let group of Object.values(tasksGrouped) as any[]) {
            total.time_charge_rounded_seconds += group.time_charge_rounded_seconds;
            total.time_recorded_seconds += group.time_recorded_seconds;
            total.time_spent_seconds += group.time_spent_seconds;
            total.time_distributed_seconds += group.time_distributed_seconds;
            total.time_not_distributed_seconds += group.time_not_distributed_seconds;
            total.time_charge_seconds += group.time_charge_seconds;
        }
        total.time_charge_rounded_text = timespanToText(total.time_charge_rounded_seconds);
        total.time_recorded_text = timespanToText(total.time_recorded_seconds);
        total.time_spent_text = timespanToText(total.time_spent_seconds);
        total.time_distributed_text = timespanToText(total.time_distributed_seconds);
        total.time_charge_text = timespanToText(total.time_charge_seconds);
        return total;
    };

    const adjustNotesHeight = () => {
        if (!globalNotesInput.current) {
            return;
        }
        globalNotesInput.current.style.height = "";
        globalNotesInput.current.style.height = Math.min(50, globalNotesInput.current.scrollHeight) + "px";
    };

    const copyToClipboardAllTasks = (ev) => {
        let s = '*' + moment(store.state.day_key + ' 12:00:00').format('ddd, MMM D') + "*\n";
        for (let group of Object.values(tasksGroupedAndMerged) as any[]) {
            for (let task of Object.values(group.tasks) as any[]) {
                if (!task.chargeable || task.distributed) {
                    continue;
                }
                let title = task.title;
                if (title) {
                    title = title.replaceAll('[combined]', '').trim();
                    title = title.replace(/^, /, '');
                }
                s += title + "\n" + "> " + (task.notes || '') + "\n" + "> ~" + timespanToTextHours(task.time_charge_seconds) + "\n";
            }
        }
        console.log(s);

        navigator.clipboard.writeText(s).then(() => {
            ev.target.classList.add('AnimationPulseOnceAndHide');
        }, () => {
            /* clipboard write failed */
        });
    };

    const dragStart = ($event, task) => {
        if (store.state.drag.readyToDrop) {
            return;
        }
        store.dragClear();

        store.state.drag.active = true;
        store.state.drag.startedAt = [$event.clientX, $event.clientY];
        store.state.drag.nowAt = [$event.clientX, $event.clientY];
        store.state.drag.taskFrom = task.id;
        store.state.drag.taskFrom_minutes = Math.round(task.time_spent_seconds / 60);
        store.state.drag.taskFrom_minutes_text = task.time_spent_seconds_text;
    };

    const dragContinue = ($event) => {
        if (!store.state.drag.active) {
            return;
        }
        store.state.drag.nowAt = [$event.clientX, $event.clientY];

        let distance = Math.sqrt(
            Math.pow(store.state.drag.startedAt[0] - store.state.drag.nowAt[0], 2) +
            Math.pow(store.state.drag.startedAt[1] - store.state.drag.nowAt[1], 2),
        );
        if (!store.state.drag.readyToDrop) {
            store.state.drag.distance = distance;
            let coefficient = 10.0 / Math.log10(distance);
            store.state.drag.minutes = Math.max(0, Math.round(distance / coefficient) - 5);
            store.state.drag.minutes = Math.min(store.state.drag.minutes, store.state.drag.taskFrom_minutes);

            if (store.state.drag.nowAt[0] < 80) {
                store.state.drag.minutes = 0;
            }
            store.state.drag.minutes_text = timespanToText(store.state.drag.minutes * 60);
        }
    };

    const dragStop = () => {
        store.state.drag.readyToDrop = store.state.drag.minutes > 0;
        store.state.drag.active = store.state.drag.minutes > 0;

        if (!store.state.drag.active) {
            store.dragClear();
        }
    };

    const globalNotesInputRef = useRef(null);

    useEffect(() => {
        if (globalNotesInputRef.current) {
            globalNotesInputRef.current.value = store.state.settings.global_notes;
        }
    }, [store.state.settings.global_notes]);

    const handleBlur = () => {
        store.updateSettings(store.state.settings);
    };

    function toggleShowAsReport() {
        if (store.state.tasksShowAsReport) {
            setTimeout(function () {
                forceUpdateKey.current++; // force reload to remove animation classes
            }.bind(this), 200/* transition 200ms */);
        }
        store.toggleTasksShowAsReport();
    }

    function toggleHideUnReportable() {
        if (store.state.tasksHideUnReportable) {
            setTimeout(function () {
                forceUpdateKey.current++; // force reload to remove animation classes
            }.bind(this), 200/* transition 200ms */);
        }
        store.toggleHideUnReportable();
    }

    return (
        <div className="TasksWindow" onMouseMove={dragContinue} onMouseUp={dragStop}>
            {store.state.drag.active && store.state.drag.distance > 20 && (
                <div className="DragGhost" style={{left: `${store.state.drag.nowAt[0] + 6}px`, top: `${store.state.drag.nowAt[1] - 24}px`}}>
                    {store.state.drag.minutes > 0 ? (
                        <>
                            <span>{store.state.drag.minutes_text}</span>
                            <LineChart className="progress-bar--no-transition" height={5} total={store.state.drag.taskFrom_minutes} progress_info={store.state.drag.minutes}/>
                        </>
                    ) : (
                        <span>cancel</span>
                    )}
                </div>
            )}
            <div className="TRow --header">
                <div className="TRowContent">
                    <div className="TCol --hierarchy"><i className="icofont-rounded-down"></i></div>
                    <div className="TCol --chargeable"><i className="icofont-not-allowed"></i></div>
                    <div className="TCol --distributed"><i className="icofont-exchange"></i></div>
                    <div className="TCol --frozen"><i className="icofont-unlock"></i></div>
                    <div className="TCol --code">Code</div>
                    <div className="TCol --title">Title</div>
                    <div className="TCol --frozen"><i className="icofont-unlock"></i></div>
                    <div className="TCol --timespan">Time</div>
                    <div className="TCol --timespan"></div>
                </div>
            </div>
            <div className={`TasksTable ${store.state.tasksShowAsReport ? 'ShowAsReport' : ''} ${store.state.tasksHideUnReportable ? 'ShowCompact' : ''}`} key={forceUpdateKey.current} onClick={() => store.deselectAll()}>
                {tasksGrouped.length > 1 && (
                    <div className="TRowDate Total">
                        <div className="TCol --frozen"></div>
                        <div className="TCol --group-date">Total</div>
                        <div className="TCol --timespan --timespan-charge">
                            <span title="Charge (Not distributed)">{timespanToText(total.time_not_distributed_seconds)}</span>
                            &nbsp;
                            <span title="Charge (Rounded)">{total.time_charge_rounded_text}</span>
                            {total.time_recorded_text !== '-' && <span title="Recorded" className="original-time"> ({total.time_recorded_text})</span>}
                            &nbsp;
                            <span title="Spent">{total.time_spent_text}</span>
                        </div>
                    </div>
                )}
                {Object.entries(tasksGrouped).map(([date, group]: [any, any]) => (<React.Fragment key={date}>
                    <div className={`TRowDate ${tasksGrouped.length > 1 ? 'SubTotal' : ''} ${group.erroneous ? 'Erroneous' : ''} ${store.state.tasks[store.state.taskTimeredId]?.date === date ? 'TimeredGroup' : ''}`}
                    >
                        <div className="TCol --frozen"><i className="IconAsInput icofont-wall-clock"></i></div>
                        <div className="TCol --group-date">{date}</div>
                        <div className="TCol --timespan --timespan-charge">
                            <span title="Charge (Not distributed)">{timespanToText(group.time_not_distributed_seconds)}</span>
                            &nbsp;
                            <span title="Charge (Rounded)">{group.time_charge_rounded_text}</span>
                            {group.time_recorded_text !== '-' && <span title="Recorded" className="original-time"> ({group.time_recorded_text})</span>}
                            &nbsp;
                            <span title="Spent">{group.time_spent_text}</span>
                        </div>
                    </div>
                    {Object.entries(group.tasks).map(([task_id, task]: any) => (
                        !task.parentId || store.parentIsMissing(task) ? (
                            <TaskRow key={task_id} tasksGrouped={tasksGrouped} group_id={date} task_id={task_id} onDragStart={dragStart}/>
                        ) : null
                    ))}
                </React.Fragment>))}
            </div>
            <div>
                <textarea className="GlobalNotes" rows="1" ref={globalNotesInputRef} onBlur={handleBlur}></textarea>
            </div>
            {/*<CalendarWindow key={store.state.day_key} week_key={store.state.week_key} />*/}
            <div className="ViewOptions">
                {store.state.drag.readyToDrop && <a href="#" onClick={store.dragClear} style={{float: 'right'}}>cancel</a>}
                View as report:
                <span className="label--checkbox label--checkbox--with-text" onClick={toggleShowAsReport}>
                    <label><input type="checkbox" checked={store.state.tasksShowAsReport} readOnly/><span></span> merge codes</label>
                </span>
                <span className="label--checkbox label--checkbox--with-text" onClick={toggleHideUnReportable}>
                    <label><input type="checkbox" checked={store.state.tasksHideUnReportable} readOnly/><span></span> hide un-reportable</label>
                </span>
                <button type="button" className="btn btn-xs" style={{marginLeft: '6px', padding: '0px 8px'}} title="Copy for Slack. NOTE: Ctrl+F applies formatting in Slack" onClick={copyToClipboardAllTasks}>
                    <i className="icofont-copy"></i>
                </button>
            </div>
            <div className="Chart" title={JSON.stringify(total, null, 2)}>
                <div className="Total" style={{height: '4px', background: '#696969'}}>
                    <div className="Charge" style={{height: '4px', background: '#46e148', width: `${(100 * (total.time_charge_rounded_seconds / Math.max(total.time_spent_seconds, store.state.settings.working_day_minutes * 60)))}%`}}>
                        <div className="Distributed" style={{height: '2px', background: '#b403b4', width: `${(100 * (total.time_distributed_seconds / total.time_charge_rounded_seconds))}%`}}></div>
                    </div>
                </div>
                <div className="Total" style={{width: '100%', background: '#ffadad'}}>
                    <div className="WorkingDay" style={{
                        height: '3px',
                        background: 'green',
                        width: `${(store.state.settings.working_day_minutes * 60) / (Math.max(total.time_spent_seconds, store.state.settings.working_day_minutes * 60)) * 100}%`,
                    }}></div>
                </div>
            </div>
            <div className="SelectionStatistics">
                {JSON.stringify(store.state.drag)}
            </div>
            {/*<div className="Timeline" ref={timelineRef}>
                <div className="TimelineItems">
                    <div style={{width: '55px'}}><span>8:36</span></div>
                    <div style={{width: '55px'}}><span>9:15</span></div>
                    <div style={{width: '325px'}}><span>9:25</span></div>
                    <div style={{width: '325px'}}><span>15:40</span></div>
                    <div style={{width: '225px'}}><span>18:40</span></div>
                </div>
            </div>*/}
        </div>
    );
};

export default TasksWindow;
