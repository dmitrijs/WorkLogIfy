import {cloneDeep, groupBy, map, mapValues} from "lodash";
import moment from "moment";
import store from "../Store/Store";
import {applyRoundingMinutes, comparatorLt, timespanToText} from "../Utils/Utils";

export function build_sort_value(task: TaskObj & {
    task_not_started: boolean, last_session: SessionObj, first_session: SessionObj, is_timered: boolean,
}) {
    if (store.state.settings.sorting_order === 'first_session') {
        return '' // 9 - higher, 0 - lower
            + (task.task_not_started ? '9' : '0')
            + (task.first_session ? task.first_session.started_at : '')
            + '';
    }

    return '' // 9 - higher, 0 - lower
        + (task.is_done ? '0' : '9')
        + (task.task_not_started ? '9' : '0')
        + (task.is_timered ? '9' : '0')
        + (task.time_spent_seconds ? '9' : '0')
        + (task.is_done ? task.is_done_at : '')
        + (task.is_on_hold ? '0' : '9')
        + (task.is_on_hold ? task.is_on_hold_at : '')
        + (task.last_session ? task.last_session.finished_at : '')
        + '';
}

class TasksSorter {
    codeToLastSession = {};

    constructor(tasks: Record<string, TaskObj>) {
        Object.values(tasks).forEach((task) => {
            const code = (!task.code || task.code === 'idle' ? task.id : task.code);
            let started_at = 0;
            if (task.sessions[task.sessions?.length - 1]?.started_at) {
                started_at = moment(task.sessions[task.sessions?.length - 1]?.started_at).unix();
            }
            if (store.state.taskTimeredId === task.id) {
                started_at = moment().unix();
            }
            if (started_at) {
                this.codeToLastSession[code] = Math.max(this.codeToLastSession[code] ?? -1, started_at);
            }
        })
    }

    enhanceTask(task: TaskObj) {
        let task_not_started = true;
        let last_session = null;
        let first_session = null;
        if (task.sessions && task.sessions.length > 0) {
            task_not_started = false;
            last_session = task.sessions[task.sessions.length - 1];
            first_session = task.sessions[0];
        }
        let is_timered = (store.state.taskTimeredId === task.id);
        return Object.assign({}, task, {
            task_not_started, last_session, first_session, is_timered,
        });
    }

    compare(task1: TaskObj, task2: TaskObj, forReport = false) {
        const a = this.enhanceTask(task1);
        const b = this.enhanceTask(task2);

        if (store.state.settings.sorting_order === 'last_session_group_same_code') {
            const aCode = (!a.code || a.code === 'idle' ? a.id : a.code);
            const bCode = (!b.code || b.code === 'idle' ? b.id : b.code);

            if (this.codeToLastSession[aCode] !== this.codeToLastSession[bCode]) {
                return -1 * (this.codeToLastSession[aCode] - this.codeToLastSession[bCode]);
            }

            if (!(a.distributed || !a.chargeable) && (b.distributed || !b.chargeable)) {
                return -1;
            }
            if ((a.distributed || !a.chargeable) && !(b.distributed || !b.chargeable)) {
                return 1;
            }

            if (forReport) {
                if (a.code === 'other' && b.code !== 'other') {
                    return -1;
                }
                if (a.code !== 'other' && b.code === 'other') {
                    return 1;
                }

                const aTime = a.first_session?.started_at || a.created_at;
                const bTime = b.first_session?.started_at || b.created_at;

                return (store.state.tasksHideUnReportable || store.state.tasksShowAsReport ? -1 : 1) *
                    (aTime > bTime ? -1 : 1);
            }

            const aTime = a.last_session?.started_at || a.created_at;
            const bTime = b.last_session?.started_at || b.created_at;

            return (store.state.tasksHideUnReportable || store.state.tasksShowAsReport ? -1 : 1) *
                (aTime > bTime ? -1 : 1);
        }

        return comparatorLt(build_sort_value(a), build_sort_value(b));
    }
}

export function sort_tasks(tasks: Record<string, TaskObj>, forReport = false): Record<string, TaskObj> {
    const sorter = new TasksSorter(tasks);

    return Object.fromEntries(Object.entries(tasks).sort((task1: [string, TaskObj], task2: [string, TaskObj]) => {
        return sorter.compare(task1[1], task2[1], forReport);
    }));
}

export function Store_MergeSameCodes(tasks: Record<string, any>) {
    let unique = {} as Record<string, any>;
    let idx = 0;

    Object.values(tasks).forEach((task: TaskObj) => {
        idx++;
        let existing = unique[task.code];
        if (!existing) {
            unique[task.code] = {...task};
            return;
        }

        if (task.time_charge_seconds <= 0) { // no action required
            return;
        }
        if (existing.time_charge_seconds <= 0) { // replace empty
            unique[task.code] = {...task};
            return;
        }

        console.log(task.code, 'Adding', task.time_charge_text, 'to', existing.time_charge_text);

        existing.time_charge_seconds = existing.time_charge_seconds + task.time_charge_seconds;
        existing.time_charge_text = timespanToText(existing.time_charge_seconds);

        let title = existing.title;
        if (!title) {
            title = '';
        }
        if (task.title && task.title !== title) {
            title += (title ? ', ' : '') + task.title;
        }
        if (title.indexOf('[combined] ') !== 0) {
            title = '[combined] ' + title;
        }
        existing.title = title.trim();

        let notes = existing.notes;
        if (!notes) {
            notes = '';
        }
        if (task.notes) {
            if (notes && !notes.match(/[.;]$/)) {
                notes += '.';
            }
            notes += (notes ? ' ' : '') + task.notes;
        }
        existing.notes = notes.trim();

        let comment = existing.comment;
        if (!comment) {
            comment = '';
        }
        if (task.comment) {
            if (comment && !comment.match(/[.;]$/)) {
                comment += '.';
            }
            comment += (comment ? ' ' : '') + task.comment;
        }
        existing.comment = comment.trim();

        existing.id = 'group_' + idx;
        existing.grouped = true;
        existing.parentId = null;

        unique[task.code] = existing;
    });

    return sort_tasks(unique, true);
}

export default function Store_GetGroupedTasks(): Record<string, TaskGroupObj> {
    if (!store.state.tasks) {
        return {};
    }

    const tasksList = [];
    Object.values(store.state.tasks).forEach((originalTask, key) => {
        const task = cloneDeep(originalTask);
        task._selected = !!store.state.tasksSelectedIds[key];

        task.time_charge_text = 'error';

        task.time_spent_seconds = task.sessions.reduce((sum, obj: SessionObj) => sum + obj.spent_seconds, 0);
        if (store.state.taskTimeredId === task.id) {
            task.time_spent_seconds += store.state.timerElapsedSeconds;
            task.timer_elapsed_seconds_text = timespanToText(store.state.timerElapsedSeconds);
        }
        task.time_spent_text = timespanToText(task.time_spent_seconds);

        task.time_recorded_seconds = task.records.reduce((sum, obj: RecordObj) => sum + obj.recorded_seconds, 0);
        task.time_recorded_text = timespanToText(task.time_recorded_seconds);

        task.group_key = task.date;
        if (store.state.tasksShowAsReport || store.state.tasksHideUnReportable) {
            task.group_key = store.state.day_key;
        }
        tasksList.push(task);
    });

    const tasks = groupBy(tasksList, 'group_key');

    let groups = mapValues(tasks, (tasksList, date) => {
        let spent = 0;
        let charge = 0;
        let distributed = 0;
        let not_distributed = 0;
        let time_recorded = 0;

        const tasks = {} as Record<string, TaskObj>;
        tasksList.forEach((task) => {
            const seconds = parseInt(String(task.time_spent_seconds));
            spent += (seconds);
            if (task.chargeable) {
                charge += seconds;

                if (task.distributed) {
                    distributed += seconds;
                } else {
                    if (!task.frozen) {
                        not_distributed += seconds;
                    }
                }
            }
            time_recorded += task.time_recorded_seconds;

            tasks[task.id] = task;
        });

        return <TaskGroupObj>{
            tasks: tasks,
            time_charge_seconds: charge,
            time_spent_seconds: spent,
            time_distributed_seconds: distributed,
            time_not_distributed_seconds: not_distributed,
            time_charge_text: timespanToText(charge),
            time_spent_text: timespanToText(spent),
            time_recorded_text: timespanToText(time_recorded),

            duplicatesExist: null,
            time_charge_rounded_seconds: null,
            time_charge_rounded_text: null,
        };
    });

    // populate charge_time
    groups = mapValues(groups, (group) => {

        let distributed = group.time_distributed_seconds;
        let not_distributed = group.time_not_distributed_seconds;

        if (not_distributed === 0) {
            return group;
        }

        let tasks = map(group.tasks, (task) => {
            // no charging for lunch, meetings
            if (!task.chargeable || task.distributed) {
                task.time_charge_seconds = 0;

            } else if (task.frozen) {
                task.time_charge_seconds = task.time_spent_seconds;

            } else {
                let spent = parseInt(String(task.time_spent_seconds));

                task.time_charge_seconds = spent + ((spent / not_distributed) * distributed);
            }

            task.time_charge_text = timespanToText(task.time_charge_seconds);
            return task;
        });

        // round times
        let time_charge_rounded_seconds = 0;
        tasks = tasks.map((task) => {

            task.time_charge_seconds = applyRoundingMinutes(task.time_charge_seconds);
            task.time_charge_text = timespanToText(task.time_charge_seconds);

            time_charge_rounded_seconds += task.time_charge_seconds;
            return task;
        });

        {
            let secondsMissing = group.time_charge_seconds - time_charge_rounded_seconds;
            let microTimeBlockSeconds = 60 * 5;
            let blockCount = Math.round((secondsMissing + 60) / microTimeBlockSeconds);
            let secondsMissingRounded = blockCount * microTimeBlockSeconds;

            // chargest task
            let chargest_task_seconds = 100000000;
            let chargest_task_id = null;

            tasks.map((task) => {
                if (!task.frozen &&
                    task.time_charge_seconds > 0 &&
                    task.time_charge_seconds + secondsMissingRounded > 0 &&
                    task.time_charge_seconds < chargest_task_seconds) {
                    chargest_task_seconds = task.time_charge_seconds;
                    chargest_task_id = task.id;
                }
            });

            if (Math.abs(secondsMissing) > 60) {
                tasks.map((task) => {
                    if (task.id === chargest_task_id) {
                        time_charge_rounded_seconds += secondsMissingRounded;
                        task.time_charge_seconds += secondsMissingRounded;
                        task.time_charge_text = timespanToText(task.time_charge_seconds);
                    }
                    return task;
                });
            }
        }

        let duplicatesExist = false;
        let duplicatesCheck = {};
        tasks.forEach((task) => {
            if (task.time_charge_seconds <= 0) {
                return;
            }
            if (duplicatesCheck[task.code]) {
                duplicatesExist = true;
            }
            duplicatesCheck[task.code] = true;
        });

        tasks.forEach((task) => {
            task.time_charge_extra_seconds = task.time_charge_seconds - task.time_spent_seconds;
            task.time_charge_extra_text = timespanToText(task.time_charge_extra_seconds);
            task.time_unrecorded_seconds = task.time_charge_seconds - task.time_recorded_seconds;
            task.time_unrecorded_text = timespanToText(task.time_unrecorded_seconds);
        });

        const tasksMap = {} as Record<string, TaskObj>;
        tasks.forEach((task: TaskObj) => {
            tasksMap[task.id] = task;
        })

        group.tasks = sort_tasks(tasksMap);
        group.duplicatesExist = duplicatesExist;
        group.time_charge_rounded_seconds = time_charge_rounded_seconds;
        group.time_charge_rounded_text = timespanToText(time_charge_rounded_seconds);
        return group;
    });

    return Object.fromEntries(Object.entries(groups).sort((group1: [string, TaskGroupObj], group2: [string, TaskGroupObj]) => {
        return -1 * (group1[0].localeCompare(group2[0]));
    }));
}
