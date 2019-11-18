import {List, Map} from "immutable";
import {comparatorLt, timespanToText} from "../Utils/Utils";

export function sort_tasks(tasks) {
    return tasks.sort((task1, task2) => {
        let sess1 = task1.sessions;
        let sess2 = task2.sessions;
        let text1 = '9999-' + task1.id;
        let text2 = '9999-' + task2.id;
        if (sess1 && sess1[0]) {
            text1 = sess1[0].started_at;
        }
        if (sess2 && sess2[0]) {
            text2 = sess2[0].started_at;
        }
        return comparatorLt(text1, text2);
    });
}

export default function Store_GetGroupedTasks(state) {
    console.log('getTasksGrouped');
    // populate time charge
    let result;
    result = List<Task>();

    if (!state.tasks) {
        return result;
    }

    state.tasks.forEach((task, key) => {
        if (Map.isMap(task)) {
            task = task.toJS();
        }
        (<any>task)._selected = state.tasksSelectedIds.get(key);

        (<any>task).time_charge_text = 'error';

        let spentSeconds = task.sessions.reduce((sum, obj) => sum + obj.spent_seconds, 0);

        (<any>task).time_spent_seconds = spentSeconds;
        (<any>task).time_spent_text = timespanToText(spentSeconds);
        result = result.push(task);
    });

    result = result.groupBy((x) => x['date']);
    result = result.sortBy((val, key) => key, comparatorLt);

    //
    result = result.map((tasks) => {

        let spent = 0;
        let charge = 0;
        let distributed = 0;
        let not_distributed = 0;

        tasks.forEach((task) => {
            const seconds = parseInt(task.time_spent_seconds);
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

        spent += state.timerElapsed;
        charge += state.timerElapsed;

        tasks = sort_tasks(tasks);

        return Map({
            tasks: tasks,
            time_charge_seconds: charge,
            time_spent_seconds: spent,
            time_distributed_seconds: distributed,
            time_not_distributed_seconds: not_distributed,
            time_charge_text: timespanToText(charge),
            time_spent_text: timespanToText(spent),
        });
    });

    // populate charge_time
    result = result.map((group) => {

        let tasks = group.get('tasks');
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
                let spent = parseInt(task.time_spent_seconds);

                task.time_charge_seconds = spent + ((spent / not_distributed) * distributed);
            }

            (<any>task).time_charge_text = timespanToText(task.time_charge_seconds);
            return task;
        });

        return group.set('tasks', tasks);
    });

    console.log(result.toJS());
    return result.toJS();
}
