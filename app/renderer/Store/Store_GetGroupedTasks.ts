import {Iterable, List, Map, OrderedMap} from "immutable";
import {comparatorLt, timespanToText} from "../Utils/Utils";
import {AppState} from "./Store";

export function sort_tasks(tasks) {
    return tasks.sort((task1, task2) => {
        let sess1 = task1.sessions;
        let sess2 = task2.sessions;
        let text1 = '9999-new-on-top-' + task1.id;
        let text2 = '9999-new-on-top-' + task2.id;
        if (sess1 && sess1[0]) {
            text1 = sess1[0].started_at;
        }
        if (sess2 && sess2[0]) {
            text2 = sess2[0].started_at;
        }
        // if (!task1.chargeable) {
        //     text1 = '0000-unimportant-in-bottom-' + text1;
        // }
        // if (!task2.chargeable) {
        //     text2 = '0000-unimportant-in-bottom-' + text2;
        // }
        return comparatorLt(text1, text2);
    });
}

export function Store_MergeSameCodes(tasks: Map<string, any>) {
    let unique = Map<string, any>();
    tasks.map((task: TaskObj) => {
        let existing = unique.get(task.code);
        if (!existing) {
            unique = unique.set(task.code, {...task});
            return;
        }

        if (task.time_charge_seconds <= 0) { // no action required
            return;
        }
        if (existing.time_charge_seconds <= 0) { // replace empty
            unique = unique.set(task.code, {...task});
            return;
        }

        console.log(task.code, 'Adding', task.time_charge_text, 'to', existing.time_charge_text);

        existing.time_charge_seconds = existing.time_charge_seconds + task.time_charge_seconds;
        existing.time_charge_text = timespanToText(existing.time_charge_seconds);

        let title = existing.title;
        if (!title) {
            title = '';
        }
        if (task.title) {
            title += (title ? '; ' : '') + task.title;
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
            notes += (notes ? '; ' : '') + task.notes;
        }
        existing.notes = notes.trim();

        delete existing.id;

        console.log('existing', existing);

        unique = unique.set(task.code, existing);
    });

    console.log('unique', unique.toJS());

    let tasksList = unique.toList();
    return sort_tasks(tasksList);
}

export default function Store_GetGroupedTasks(state: AppState) {
    console.log('getTasksGrouped');
    // populate time charge
    let tasksList = List<TaskObj>();

    if (!state.tasks) {
        return tasksList;
    }

    state.tasks.forEach((taskMap, key) => {
        let task: TaskObj;
        if (Map.isMap(taskMap)) {
            task = taskMap.toJS();
        } else {
            task = <any>taskMap;
        }
        task._selected = !!state.tasksSelectedIds.get(key);

        task.time_charge_text = 'error';

        let spentSeconds = task.sessions.reduce((sum, obj: SessionObj) => sum + obj.spent_seconds, 0);

        task.time_spent_seconds = spentSeconds;
        if (state.taskTimeredId === task.id) {
            task.time_spent_seconds += state.timerElapsed;
            task.timer_elapsed_seconds_text = timespanToText(state.timerElapsed);
        }

        task.time_spent_text = timespanToText(task.time_spent_seconds);
        tasksList = tasksList.push(task);
    });

    let tasks: OrderedMap<string, Iterable<number, TaskObj>>;
    tasks = tasksList.groupBy((x) => x.date).toOrderedMap();

    let groups = Map<string, any>();
    groups = tasks.map((tasks) => {

        let spent = 0;
        let charge = 0;
        let distributed = 0;
        let not_distributed = 0;

        tasks.forEach((task) => {
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
        });

        return Map({
            tasks: tasks,
            time_charge_seconds: charge,
            time_spent_seconds: spent,
            time_distributed_seconds: distributed,
            time_not_distributed_seconds: not_distributed,
            time_charge_text: timespanToText(charge),
            time_spent_text: timespanToText(spent),
        });
    }).toMap();

    // populate charge_time
    groups = <any>groups.map((group) => {

        let tasks: List<TaskObj> = group.get('tasks');
        let distributed = group.get('time_distributed_seconds');
        let not_distributed = group.get('time_not_distributed_seconds');

        if (not_distributed === 0) {
            return group;
        }

        tasks = tasks.map((task) => {
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
            task.time_charge_extra_seconds = task.time_charge_seconds - task.time_spent_seconds;
            task.time_charge_extra_text = timespanToText(task.time_charge_extra_seconds);
            return task;
        }).toList();

        // round times
        let time_charge_rounded_seconds = 0;
        tasks = tasks.map((task) => {
            let timeBlockLengthSeconds = 60 * 10;
            let blockCount = Math.round(task.time_charge_seconds / timeBlockLengthSeconds);
            task.time_charge_seconds = blockCount * timeBlockLengthSeconds;
            task.time_charge_text = timespanToText(task.time_charge_seconds);

            time_charge_rounded_seconds += task.time_charge_seconds;
            return task;
        }).toList();

        {
            let secondsMissing = parseInt(group.get('time_charge_seconds')) - time_charge_rounded_seconds;
            let microTimeBlockSeconds = 60 * 5;
            let blockCount = Math.round((secondsMissing + 60) / microTimeBlockSeconds);
            let secondsMissingRounded = blockCount * microTimeBlockSeconds;
            console.log('minutesMissing', secondsMissing / 60);
            console.log('minutesMissingRounded', secondsMissingRounded / 60);

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
            console.log('chargest_task_id', chargest_task_id);

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

        tasks = sort_tasks(tasks);

        group = group.set('duplicatesExist', duplicatesExist);
        group = group.set('tasks', tasks);
        group = group.set('time_charge_rounded_seconds', time_charge_rounded_seconds);
        group = group.set('time_charge_rounded_text', timespanToText(time_charge_rounded_seconds));
        return group;
    });

    console.log(groups.toJS());
    return groups;
}
