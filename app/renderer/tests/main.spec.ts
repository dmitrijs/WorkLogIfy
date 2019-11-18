import {sort_tasks} from "../Store/Store_GetGroupedTasks";
import {OrderedMap} from "immutable";

jest.setTimeout(60000);

test('test1', async () => {
    let tasks = OrderedMap({
        t200: {
            sessions: [{started_at: '2000-01-01T16:00:00Z'}],
        },
        t400: {
            sessions: [{started_at: '2000-01-01T12:00:00Z'}],
        },
        t300: {
            sessions: [{started_at: '2000-01-01T13:00:00Z'}],
        },
        t150: {
            id: 'task_15000',
            sessions: [],
        },
        t100: {
            id: 'task_16000', // newest
            sessions: [],
        },
    });
    expect(sort_tasks(tasks).keySeq().toArray()).toEqual(['t100', 't150', 't200', 't300', 't400']);
});
