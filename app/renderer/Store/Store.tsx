import supabase, {supabaseCheckState, useSupabaseSettings} from "@/renderer/Store/Supabase";
import {cloneDeep, isArray, keyBy} from "lodash";
import moment from "moment";
import {createContext, useContext, useEffect, useMemo, useState} from "react";
import {StoreApi, UseBoundStore} from 'zustand'
import {create} from "zustand/react";
import {timespanToText} from '../Utils/Utils';
import Store_GetGroupedTasks from "./Store_GetGroupedTasks";

function saveTasks(state) {
    populateSubtaskIds(state);

    window.ipc.sendSync('tasks.save', {
        day_key: state.day_key,
        arg1: cloneDeep(state.tasks),
        arg2: cloneDeep(Store_GetGroupedTasks(state)),
        arg3: cloneDeep(state.settings),
    });
}

function populateSubtaskIds(state) {
    const subtasks = {} as Map<string, string[]>;
    for (let task of Object.values(state.tasks) as any[]) {
        if (task.parentId) {
            subtasks[`${task.date}/${task.parentId}`] = subtasks[`${task.date}/${task.parentId}`] || [];
            subtasks[`${task.date}/${task.parentId}`].push(task.id);
        }
    }
    for (let task of Object.values(state.tasks) as any[]) {
        task.subtaskIds = subtasks[`${task.date}/${task.id}`] || null;
    }
}

function saveActiveApps(state) {
    window.ipc.sendSync('activeApps.save', {
        day_key: state.day_key,
        activeApps: cloneDeep(state.activeApps),
    });
}

function saveTaskTemplates(state) {
    window.ipc.sendSync('tasks.templates.save', cloneDeep(state.templates));
}

function saveTaskProjects(state) {
    window.ipc.sendSync('tasks.projects.save', cloneDeep(state.projects));
}

function updateProgressBar(task: TaskObj | null) {
    if (!task || (task.title === '' && (task.notes || '') === '')) {
        window.ipc.send('set.progress', {indeterminate: true});
    } else {
        window.ipc.send('set.progress', {indeterminate: false});
    }
}

function updateTaskField(tasks: any, task_id: any, field: any, value: any) {
    tasks[task_id][field] = value;
    if (value === true) {
        tasks[task_id][field + '_at'] = moment().toISOString();
    } else if (value === false) {
        delete tasks[task_id][field + '_at'];
    }
    return tasks;
}

interface StoreBaseType {
    darkMode: boolean
    toggleDarkMode: () => void
}

const useStoreBase = create<StoreBaseType>((set) => ({
    darkMode: true,

    toggleDarkMode: () => {
        set((state) => ({darkMode: !state.darkMode}))
    },
}));

type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
    _store: S,
) => {
    const store = _store as WithSelectors<typeof _store>
    store.use = {}
    for (const k of Object.keys(store.getState())) {
        ;(store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
    }

    return store
}

export const useStore = createSelectors(useStoreBase)

const StoreContext = createContext();

const initialState = {
    initialized: false,
    tasks: {} as Record<string, TaskObj>,

    activeApps: [] as ActiveAppObj[],

    taskLastSelected: '',
    creatingByExtract: false, // new task that is created is extracted from the selected task
    creatingSubtask: false, // new task that is created is extracted as a Subtask
    tasksHoveredId: null,
    taskEditedId: null,
    tasksScreen: 'tasks',
    taskTimeredId: null,
    tasksShowAsReport: false,
    tasksHideUnReportable: false,
    timerElapsedText: null,
    timerElapsedSeconds: 0,
    lastSavedElapsedSeconds: 0,
    screen: 'tasks',
    is_debug: false,
    day_key: '',
    week_key: '',
    day_key_next_week: '',
    day_key_prev_week: '',
    allFiles: [],
    fileTotals: {},
    templates: [] as TemplateObj[],
    createdTaskId: '',
    taskInClipboard: null as TaskObj,
    taskIsCloned: false,
    calendarHoveredDayCode: null,

    asanaTasks: {} as Record<string, AsanaTaskObj>,
    youtrackTasks: {} as Record<string, YoutrackTaskObj>,

    settings: {} as SettingsObj,
    drag: {
        active: false,
        readyToDrop: false,
        distance: 0,
        minutes: 0,
        minutes_text: '',
        startedAt: [0, 0],
        nowAt: [0, 0],
        taskFrom: '',
        taskFrom_minutes: 0,
        taskFrom_minutes_text: '',
        taskTo: '',
    },
    _now: null,
    cloudError: '',
};

type StoreMethodsType = {
    updateState: (values) => void,
    upsertTasks: (tasks?: any) => Promise<void>,
    deleteTask: (uid) => Promise<void>,
    updateSettingsState: (values) => void,
    getEditedTask: () => TaskEditedObj,
    getEmptyTask: () => TaskEditedObj,
    getFileTotals: () => void,
    getTaskTemplates: () => TemplateObj[],
    getTaskProjects: () => string[],
    projectsUpdate: (list: string[]) => void,
    tasksUiHoveredId: (id: string) => void,
    tasksUiUnhoveredId: (id: string) => void,
    createTask: (task) => void,
    saveTask: (task: TaskEditedObj) => void,
    updateTask: ([task_id, field, value]) => void,
    taskAddRecordedSeconds: ([task_id, recordSeconds, jiraWorkLogId]) => void,
    setScreen: (screen) => void,
    returnToTasksScreen: () => void,
    toggleDebug: (value) => void,
    toggleTasksShowAsReport: () => void,
    toggleHideUnReportable: () => void,
    taskEdit: (key) => void,
    setDay: (day: string, supabaseState?: string) => void,
    setDayFromJson: (tasksJson: string) => void,
    loadSettings: () => void,
    updateSettings: (settings, returnToTasksScreen?: boolean) => void,
    openNextDay: () => void,
    clipboardCopy: (taskId) => void,
    clipboardCut: (taskId) => void,
    clipboardPaste: () => void,
    activateTimer: (taskId: string) => void,
    activeTimer: (secondsElapsed) => void,
    setFileTotals: (fileTotals) => void,
    setTaskTemplates: (templates) => void,
    setTaskProjects: (projects) => void,
    stopTimer: ([secondsElapsed, secondsIdle]) => void,
    taskAddSession: ([taskId, minutes, method]) => void,
    taskAddActiveApp: ([taskId, activeAppDescription, secondsIdle]) => void,
    addGlobalActiveApp: (timeredTaskId: string, activeAppDescription: string, secondsIdle: number) => void,
    templateNew: () => void,
    templateUpdate: ([idx, updated]) => void,
    templateDelete: ([idx]) => void,
    calendarHoveredDayCode: (dayCode: string) => void,
    saveTasks: () => void,
    loadAsanaTasks: (force?: boolean) => void,
    loadYoutrackTasks: (force?: boolean) => void,
    parentIsMissing: (task: TaskObj) => boolean,
    dragStart: ($event, task) => void,
    dragContinue: ($event) => void,
    dragStop: () => void,
    dropTime: (event, task_id) => void,
    dragClear: () => void,
};
type StoreType = ({ state: typeof initialState } & StoreMethodsType);

const StoreContentProvider = ({children}: any) => {

    const [state, setState] = useState(initialState);

    // state.screen = state.tasksScreen;

    function addSession(state, task_id: string, spentSeconds: number, method: string, idleSeconds = 0) {
        state.tasks[task_id].sessions.push({
            started_at: moment().subtract(spentSeconds, 'seconds').toISOString(),
            finished_at: moment().subtract(idleSeconds, 'seconds').toISOString(),
            spent_seconds: (spentSeconds - idleSeconds),
            method: method,
        })
    }

    function addActiveApp(state, task_id: string, activeAppDescription: string, secondsIdle: number) {
        let activeApps = state.tasks[task_id].activeApps;
        activeApps.push({
            noticed_at: moment().toISOString(),
            seconds_idle: secondsIdle,
            description: activeAppDescription,
        });
        state.tasks[task_id].activeApps = activeApps;
        storeMethods.updateState({tasks: {...state.tasks}})
        storeMethods.upsertTasks();
    }

    function addRecord(state, task_id: string, recordedSeconds: number, method: string, jiraWorkLogId = null) {
        let records = state.tasks[task_id].records;
        let record = {
            created_at: moment().toISOString(),
            recorded_seconds: recordedSeconds,
            method: method,
        };
        if (jiraWorkLogId) {
            record['jiraWorkLogId'] = jiraWorkLogId;
        }
        records.push(record);
        state.tasks[task_id].records = records;
        storeMethods.updateState({tasks: {...state.tasks}})
        storeMethods.upsertTasks();
    }

    const storeMethods: StoreMethodsType = {
        async upsertTasks(tasks = null) {
            if (useSupabaseSettings.getState().state === 'unauthenticated') {
                return;
            }
            console.log("upsertTasks")
            const tsks = [];
            for (let task of Object.values<TaskObj>(tasks || state.tasks)) {
                const tsk = {
                    date: state.day_key,
                    uid: task.id,
                    code: task.code,
                    raw: {...task},
                };
                console.log("tsk", tsk)
                tsks.push(tsk);
            }
            const response = await supabase.from('tasks').upsert(tsks)
            if (response.error) {
                this.updateState({
                    cloudError: response.error.message,
                });
            } else {
                this.updateState({
                    cloudError: null,
                });
            }
        },

        async deleteTask(uid: string) {
            if (useSupabaseSettings.getState().state === 'unauthenticated') {
                return;
            }
            console.log("deleteTask")
            await supabase.from('tasks').delete().eq("uid", uid)
        },

        updateState(values) {
            setState((state) => ({...state, ...values, _now: new Date()}));
        },

        updateSettingsState(values) {
            setState((state) => ({...state, settings: {...state.settings, ...values}, _now: new Date()}));
        },

        getEditedTask(): TaskEditedObj {
            return state.tasks[state.taskEditedId];
        },

        getEmptyTask(): TaskEditedObj {
            let task = {
                code: '',
                title: '',
                frozen: false,
                distributed: false,
                chargeable: true,
                time_spent_seconds: 0,
                date: state.day_key,
                time_add_minutes: '',
                time_record_minutes: '',
                asanaTaskGid: '',
                youtrackTaskCode: '',
                parentId: '',
            } as TaskEditedObj;

            let refTask = null as TaskObj;
            let refRootTask = null as TaskObj;
            if (state.taskLastSelected && (refTask = state.tasks[state.taskLastSelected])) {
                refRootTask = (refTask.parentId ? state.tasks[refTask.parentId] : refTask);
            }
            if (refRootTask && state.creatingSubtask) {
                task.date = refRootTask.date;
                task.code = refRootTask.code;
                task.parentId = refRootTask.id;
            }
            if (refTask && state.creatingByExtract) {
                task.taskIdExtractedFrom = state.taskLastSelected;

                let taskSpentSeconds = refTask.sessions.reduce((sum, obj: SessionObj) => sum + obj.spent_seconds, 0);
                if (state.taskTimeredId === refTask.id) {
                    taskSpentSeconds += state.timerElapsedSeconds;
                }
                task.time_add_minutes = String(Math.round(taskSpentSeconds / 60));
            }

            storeMethods.updateState({
                creatingSubtask: false,
                creatingByExtract: false,
            });
            return task;
        },

        getFileTotals() {
            return state.fileTotals;
        },

        getTaskTemplates() {
            return state.templates;
        },

        getTaskProjects() {
            return state.projects;
        },

        projectsUpdate([list]) {
            state.projects = list;

            saveTaskProjects(state);
            storeMethods.updateState({
                projects: state.projects,
            })
        },

        tasksUiHoveredId(id: string) {
            storeMethods.updateState({tasksHoveredId: id})
        },
        tasksUiUnhoveredId(id: string) {
            setState((state) => {
                if (state.tasksHoveredId !== id) {
                    return state;
                }
                return {...state, tasksHoveredId: null}
            })
        },
        createTask(task) {
            const id = 'task_' + moment.utc();
            state.tasks[id] = {
                id: id,
                code: task.code,
                title: task.title,
                distributed: !!task.distributed,
                chargeable: !!task.chargeable,
                frozen: !!task.frozen,
                notes: task.notes,
                comment: task.comment,
                source: task.source,
                date: task.date,
                created_at: moment().toISOString(),
                sessions: [],
                records: [],
                activeApps: [],
                asanaTaskGid: task.asanaTaskGid,
                youtrackTaskCode: task.youtrackTaskCode,
                parentId: task.parentId,
            };
            state.createdTaskId = id;

            if (task.time_add_minutes) {
                let spentSeconds = parseInt(task.time_add_minutes) * 60 || 0;

                if (task.taskIdExtractedFrom) {
                    addSession(state, id, spentSeconds, 'extracted');
                    addSession(state, task.taskIdExtractedFrom, -spentSeconds, 'extracted');
                } else {
                    addSession(state, id, spentSeconds, 'manual');
                }
            }
            if (task.time_add_idle_seconds) {
                let seconds = parseInt(task.time_add_idle_seconds) || 0;
                addSession(state, id, seconds, 'idle');
            }

            console.log("[createTask] final tasks", state.tasks);

            state.screen = state.tasksScreen;

            saveTasks(state);

            if (isArray(state.tasks)) {
                alert('ASSERT FAILED: `tasks` has invalid data type. Tasks might not be persisted.');
            }

            updateProgressBar(task);
            storeMethods.updateState({
                tasks: {...state.tasks},
                createdTaskId: id,
                screen: state.screen,
            })
            storeMethods.upsertTasks();
        },
        saveTask(task: TaskEditedObj) {
            state.tasks[task.id].code = task.code;
            state.tasks[task.id].title = task.title;
            state.tasks[task.id].date = task.date;
            state.tasks[task.id].distributed = !!task.distributed;
            state.tasks[task.id].chargeable = !!task.chargeable;
            state.tasks[task.id].frozen = !!task.frozen;
            state.tasks[task.id].notes = task.notes;
            state.tasks[task.id].comment = task.comment;
            state.tasks[task.id].source = task.source;
            state.tasks[task.id].asanaTaskGid = task.asanaTaskGid;
            state.tasks[task.id].youtrackTaskCode = task.youtrackTaskCode;
            state.tasks[task.id].parentId = task.parentId;

            if (task.time_add_minutes) {
                let spentSeconds = parseInt(task.time_add_minutes) * 60 || 0;

                addSession(state, task.id, spentSeconds, 'manual');
            }
            if (task.time_record_minutes) {
                let recordSeconds = parseInt(task.time_record_minutes) * 60 || 0;

                addRecord(state, task.id, recordSeconds, 'manual');
            }

            state.taskEditedId = null;
            state.screen = state.tasksScreen;

            saveTasks(state);

            updateProgressBar(task);
            storeMethods.updateState({
                tasks: {...state.tasks},
                taskEditedId: null,
                screen: state.screen,
            })
            storeMethods.upsertTasks();
        },
        updateTask([task_id, field, value]) {
            state.tasks = updateTaskField(state.tasks, task_id, field, value);
            if ((field === 'chargeable' && !value) || (field === 'distributed' && value)) {
                state.tasks = updateTaskField(state.tasks, task_id, 'is_done', true);
            }
            saveTasks(state);
            storeMethods.updateState({
                tasks: {...state.tasks},
            })
            storeMethods.upsertTasks();
        },
        taskAddRecordedSeconds([task_id, recordSeconds, jiraWorkLogId]) {
            addRecord(state, task_id, recordSeconds, 'quick', jiraWorkLogId);

            saveTasks(state);
            // storeMethods.updateState()
        },
        setScreen(screen) {
            if (state.drag.active) {
                return;
            }
            state.screen = screen;
            if (screen === 'tasks') {
                state.tasksScreen = screen;
            }
            storeMethods.updateState({
                screen: state.screen,
                tasksScreen: state.tasksScreen,
            })
        },
        returnToTasksScreen() {
            state.screen = state.tasksScreen;
            storeMethods.updateState({
                screen: state.screen,
            })
        },
        toggleDebug(value) {
            state.is_debug = value;
            storeMethods.updateState({
                is_debug: state.is_debug,
            })
        },
        toggleTasksShowAsReport() {
            state.tasksShowAsReport = !state.tasksShowAsReport;
            storeMethods.updateState({
                tasksShowAsReport: state.tasksShowAsReport,
            })
        },
        toggleHideUnReportable() {
            state.tasksHideUnReportable = !state.tasksHideUnReportable;
            storeMethods.updateState({
                tasksHideUnReportable: state.tasksHideUnReportable,
            })
        },
        taskEdit(key) {
            state.taskEditedId = key;
            state.screen = 'task.edit';
            storeMethods.updateState({
                taskEditedId: state.taskEditedId,
                screen: state.screen,
            })
        },
        async setDay(day: string, supabaseState = null) {
            if (state.taskTimeredId) {
                alert('Cannot change date if some task is active.');
                return;
            }
            state.day_key = day;
            state.week_key = moment(day, "YYYY-MM-DD").endOf('isoWeek').format('YYYY-WW');
            state.day_key_prev_week = moment(day, "YYYY-MM-DD").startOf('isoWeek').subtract(1, 'week').format('YYYY-MM-DD');
            state.day_key_next_week = moment(day, "YYYY-MM-DD").endOf('isoWeek').add(1, 'day').format('YYYY-MM-DD');

            let workday;

            workday = window.ipc.sendSync('tasks.load', state.day_key);

            console.log("setDay supabaseState", supabaseState, useSupabaseSettings.getState().state)
            if ((supabaseState || useSupabaseSettings.getState().state) === 'enabled') {
                const tasksRaw = await supabase.from('tasks').select('*').eq('date', day).order('raw->>time_spent_seconds', {ascending: false});
                const tasks = workday.tasks || {};
                for (let taskRaw of tasksRaw.data) {
                    tasks[taskRaw.uid] = taskRaw.raw;
                }

                workday = {
                    tasks: tasks,
                    activeApps: [],
                }
            }

            state.tasks = workday.tasks;
            state.activeApps = workday.activeApps;
            if (!state.activeApps) {
                state.activeApps = [];
            }
            storeMethods.updateState({
                day_key: state.day_key,
                week_key: state.week_key,
                day_key_prev_week: state.day_key_prev_week,
                day_key_next_week: state.day_key_next_week,
                tasks: state.tasks,
                activeApps: state.activeApps,
            })
            // no need to upsert tasks
        },
        setDayFromJson(tasksJson: string) {
            if (state.taskTimeredId) {
                alert('Cannot import if some task is active.');
                return;
            }
            let added = 0, replaced = 0;
            let tasks = null;
            try {
                tasks = JSON.parse(tasksJson);
            } catch (ex) {
                console.log('tasksJson could not be parsed')
            }
            if (!tasks || !Object.keys(tasks).length || !Object.keys(tasks)[0].match(/^task_\d+$/)) {
                alert(`ERROR: Invalid clipboard contents:\n\n${tasksJson}`);
                return;
            }
            for (let taskId of Object.keys(tasks)) {
                if (state.tasks[taskId]) {
                    replaced++;
                } else {
                    added++;
                }
                state.tasks[taskId] = tasks[taskId];
            }
            saveTasks(state);
            if (replaced + added > 0) {
                alert(`${added} task(s) added, ${replaced} existing task(s) replaced`);
            }
            storeMethods.updateState({
                tasks: state.tasks,
            })
            storeMethods.upsertTasks();
        },
        loadSettings() {
            state.settings = window.ipc.sendSync('settings.load');
            storeMethods.updateState({
                settings: state.settings,
            })
        },
        updateSettings(settings, returnToTasksScreen = true) {
            state.settings = {...state.settings, ...settings};
            saveTasks(state);

            if (returnToTasksScreen) {
                state.screen = state.tasksScreen;
            }
            storeMethods.updateState({
                settings: state.settings,
                screen: state.screen,
            })
        },
        openNextDay() {
            let today = moment(state.day_key, 'YYYY-MM-DD');
            let tomorrow = today.add(1, 'day').format('YYYY-MM-DD');
            this.commit('setDay', tomorrow);
            // storeMethods.updateState()
        },
        clipboardCopy(taskId) {
            state.taskInClipboard = state.tasks[taskId];
            state.taskIsCloned = true;
            storeMethods.updateState({
                taskInClipboard: state.taskInClipboard,
                taskIsCloned: state.taskIsCloned,
            })
        },
        clipboardCut(taskId) {
            state.taskInClipboard = state.tasks[taskId];
            state.taskIsCloned = false;

            delete state.tasks[taskId];
            storeMethods.deleteTask(taskId);

            saveTasks(state);
            storeMethods.updateState({
                tasks: state.tasks,
                taskInClipboard: state.taskInClipboard,
                taskIsCloned: state.taskIsCloned,
            })
            // no need to upsert tasks
        },
        clipboardPaste() {
            if (!state.taskInClipboard) {
                return;
            }

            const id = 'task_' + moment.utc();
            let newTask = {...state.taskInClipboard, id: id};

            if (state.taskIsCloned) {
                newTask.sessions = [];
                newTask.records = [];
                newTask.activeApps = [];
            }

            state.tasks[id] = newTask;

            saveTasks(state);
            storeMethods.updateState({
                tasks: state.tasks,
            })
            storeMethods.upsertTasks();
        },
        activateTimer(taskId: string) {
            if (taskId === null) {
                taskId = state.tasksHoveredId;
            }
            state.taskTimeredId = taskId;
            state.lastSavedElapsedSeconds = 0;

            state.tasks = updateTaskField(state.tasks, taskId, 'is_on_hold', false);
            state.tasks = updateTaskField(state.tasks, taskId, 'is_done', false);
            saveTasks(state)

            updateProgressBar(state.tasks[taskId]);
            storeMethods.updateState({
                taskTimeredId: state.taskTimeredId,
                lastSavedElapsedSeconds: state.lastSavedElapsedSeconds,
                tasks: state.tasks,
            })
            storeMethods.upsertTasks();
        },
        activeTimer(secondsElapsed) {
            state.timerElapsedText = '+' + timespanToText(secondsElapsed, '+');
            state.timerElapsedSeconds = secondsElapsed;

            if (secondsElapsed - state.lastSavedElapsedSeconds >= 60) { // save every minute
                state.lastSavedElapsedSeconds = secondsElapsed;

                const stateCopy = cloneDeep(state);
                addSession(stateCopy, state.taskTimeredId, secondsElapsed, 'timer');

                saveTasks(stateCopy)
                storeMethods.upsertTasks(stateCopy.tasks)
            }
            storeMethods.updateState({
                timerElapsedText: state.timerElapsedText,
                timerElapsedSeconds: state.timerElapsedSeconds,
                lastSavedElapsedSeconds: state.lastSavedElapsedSeconds,
            })
        },
        setFileTotals(fileTotals) {
            state.fileTotals = fileTotals;
            storeMethods.updateState({
                fileTotals: state.fileTotals,
            })
        },
        setTaskTemplates(templates) {
            state.templates = templates;
            storeMethods.updateState({
                templates: state.templates,
            })
        },
        setTaskProjects(projects) {
            state.projects = projects;
            storeMethods.updateState({
                projects: state.projects,
            })
        },
        stopTimer([secondsElapsed, secondsIdle]) {
            console.log('secondsElapsed', secondsElapsed, 'secondsIdle', secondsIdle);

            addSession(state, state.taskTimeredId, secondsElapsed, 'timer', secondsIdle);

            state.timerElapsedText = '';
            state.timerElapsedSeconds = 0;
            state.taskTimeredId = null;

            saveTasks(state)

            updateProgressBar(null);

            storeMethods.updateState({
                tasks: {...state.tasks},
                timerElapsedText: state.timerElapsedText,
                timerElapsedSeconds: state.timerElapsedSeconds,
                taskTimeredId: state.taskTimeredId,
            })
            storeMethods.upsertTasks();
        },
        taskAddSession([taskId, minutes, method]) {
            if (taskId.startsWith('universe')) {
                return;
            }
            addSession(state, taskId, minutes * 60, method);
            saveTasks(state)

            storeMethods.updateState({tasks: {...state.tasks}})
            storeMethods.upsertTasks();
        },
        taskAddActiveApp([taskId, activeAppDescription, secondsIdle]) {
            addActiveApp(state, taskId, activeAppDescription, secondsIdle);
            saveTasks(state)
            // storeMethods.updateState()
        },
        addGlobalActiveApp(timeredTaskId: string, activeAppDescription: string, secondsIdle: number) {
            state.activeApps.push({
                noticed_at: moment().toISOString(),
                seconds_idle: secondsIdle,
                timered_task: timeredTaskId,
                description: activeAppDescription,
            });
            saveActiveApps(state);
            storeMethods.updateState({
                activeApps: state.activeApps,
            })
        },
        templateNew() {
            state.templates.push({
                title: '',
                code: '',
                notes: '',
                comment: '',
                chargeable: true,
            });

            saveTaskTemplates(state);
            storeMethods.updateState({
                templates: state.templates,
            })
        },
        templateUpdate([idx, updated]) {
            state.templates.splice(idx, 1, updated);

            saveTaskTemplates(state);
            storeMethods.updateState({
                templates: state.templates,
            })
        },
        templateDelete([idx]) {
            state.templates.splice(idx, 1);

            saveTaskTemplates(state);
            storeMethods.updateState({
                templates: state.templates,
            })
        },
        calendarHoveredDayCode(dayCode: string) {
            state.calendarHoveredDayCode = dayCode;
            storeMethods.updateState({calendarHoveredDayCode: dayCode})
        },
        saveTasks() {
            saveTasks(state)
            // storeMethods.updateState()
        },
        loadAsanaTasks(force = false) {
            if (!force && Object.values(state.asanaTasks).length) {
                return;
            }
            const asanaTasksCall = window.ipc.sendSync('jira.request', {
                url: `https://app.asana.com/api/1.0/workspaces/${state.settings.asana_workspace_id}/tasks/search?` +
                    'opt_fields=name,assignee_section.name,permalink_url' +
                    '&resource_subtype=default_task' +
                    '&assignee.any=me' +
                    '&completed=false' +
                    '&is_subtask=false' +
                    (state.settings.asana_extra_filter || ''),
                headers: {
                    Authorization: `Bearer ${state.settings.asana_token}`,
                    Accept: 'application/json',
                    "Content-Type": "application/json",
                },
                method: 'GET',
                redirect: "follow",
                referrerPolicy: "no-referrer",
            });

            const completedOnAfter = moment()
                .subtract(2, 'months')
                .format('YYYY-MM-DD');

            const asanaTasksCompletedCall = window.ipc.sendSync('jira.request', {
                url: `https://app.asana.com/api/1.0/workspaces/${state.settings.asana_workspace_id}/tasks/search?` +
                    'opt_fields=name,assignee_section.name,permalink_url,completed_at' +
                    '&resource_subtype=default_task' +
                    '&assignee.any=me' +
                    '&completed=true&completed_on.after=' + completedOnAfter +
                    '&is_subtask=false' +
                    (state.settings.asana_extra_filter || ''),
                headers: {
                    Authorization: `Bearer ${state.settings.asana_token}`,
                    Accept: 'application/json',
                    "Content-Type": "application/json",
                },
                method: 'GET',
                redirect: "follow",
                referrerPolicy: "no-referrer",
            });

            state.asanaTasks = keyBy([
                ...asanaTasksCall.response.data,
                ...asanaTasksCompletedCall.response.data,
            ], 'gid');
            storeMethods.updateState({
                asanaTasks: state.asanaTasks,
            })
        },

        loadYoutrackTasks(force = false) {
            if (!force && Object.values(state.youtrackTasks).length) {
                return;
            }
            const youtrackTasksCall = window.ipc.sendSync('jira.request', {
                url: `https://${state.settings.youtrack_domain}/api/issues?fields=id,idReadable,description,summary,customFields(name,value(name))` +
                    '&query=' + encodeURIComponent(state.settings.youtrack_query || ''),
                headers: {
                    Authorization: `Bearer ${state.settings.youtrack_token}`,
                    Accept: 'application/json',
                    "Content-Type": "application/json",
                },
                method: 'GET',
                redirect: "follow",
                referrerPolicy: "no-referrer",
            });

            const tasksNormalized = youtrackTasksCall.response?.map((ytTask: YoutrackTaskObj) => {
                ytTask.customFields.forEach((cf) => { // set custom fields on root
                    ytTask[cf.name.replace(/ /, '_')] = cf.value?.name || cf.value;
                })
                delete ytTask.customFields;
                return ytTask;
            });

            state.youtrackTasks = keyBy(tasksNormalized, 'idReadable');
            storeMethods.updateState({
                youtrackTasks: state.youtrackTasks,
            })
        },

        parentIsMissing(task: TaskObj) {
            const parentTask = state.tasks[task.parentId];
            return !parentTask || parentTask.date !== task.date;
        },

        dragStart($event, task) {
            if (state.drag.readyToDrop) {
                return;
            }
            storeMethods.dragClear();

            state.drag.active = true;
            state.drag.startedAt = [$event.clientX, $event.clientY];
            state.drag.nowAt = [$event.clientX, $event.clientY];
            state.drag.taskFrom = task.id;
            state.drag.taskFrom_minutes = Math.round(task.time_spent_seconds / 60);
            state.drag.taskFrom_minutes_text = task.time_spent_seconds_text;

            storeMethods.updateState({
                drag: state.drag,
            })
        },

        dragContinue($event) {
            if (!state.drag.active) {
                return;
            }
            state.drag.nowAt = [$event.clientX, $event.clientY];

            let distance = Math.sqrt(
                Math.pow(state.drag.startedAt[0] - state.drag.nowAt[0], 2) +
                Math.pow(state.drag.startedAt[1] - state.drag.nowAt[1], 2),
            );
            if (!state.drag.readyToDrop) {
                state.drag.distance = distance;
                let coefficient = 10.0 / Math.log10(distance);
                state.drag.minutes = Math.max(0, Math.round(distance / coefficient) - 5);
                state.drag.minutes = Math.min(state.drag.minutes, state.drag.taskFrom_minutes);

                if (state.drag.nowAt[0] < 80) {
                    state.drag.minutes = 0;
                }
                state.drag.minutes_text = timespanToText(state.drag.minutes * 60);
            }

            storeMethods.updateState({drag: state.drag})
        },

        dragStop() {
            state.drag.readyToDrop = Math.abs(state.drag.minutes) > 0;
            state.drag.active = Math.abs(state.drag.minutes) > 0;

            if (!state.drag.active) {
                storeMethods.dragClear();
            }

            storeMethods.updateState({drag: state.drag})
        },

        dropTime(event, task_id) {
            if (!state.drag.active || !state.drag.readyToDrop) {
                return;
            }
            state.drag.readyToDrop = state.drag.active = false;
            state.drag.taskTo = task_id;

            if (Math.abs(state.drag.minutes) > 0 && state.drag.taskFrom && state.drag.taskTo && state.drag.taskFrom !== state.drag.taskTo) {
                if (state.drag.taskTo.startsWith('universe')) {
                    storeMethods.taskAddSession([state.drag.taskFrom, -state.drag.minutes, 'state.drag']);
                } else if (state.drag.taskFrom.startsWith('universe')) {
                    storeMethods.taskAddSession([state.drag.taskTo, state.drag.minutes, 'drop']);
                } else {
                    storeMethods.taskAddSession([state.drag.taskFrom, -state.drag.minutes, 'state.drag']);
                    storeMethods.taskAddSession([state.drag.taskTo, state.drag.minutes, 'drop']);
                }
            }
            storeMethods.dragClear(); // will save
        },

        dragClear() {
            state.drag.active = false;
            state.drag.readyToDrop = false;
            state.drag.minutes = 0;
            state.drag.minutes_text = '';
            state.drag.startedAt = [0, 0];
            state.drag.nowAt = [0, 0];
            state.drag.taskFrom = '';
            state.drag.taskFrom_minutes = 0;
            state.drag.taskFrom_minutes_text = '';
            state.drag.taskTo = '';
            storeMethods.updateState({drag: state.drag})
        },
    }

    // Vue.prototype.$store = store.original;

    useEffect(() => {
        async function initialize() {
            if (!state.initialized) {
                const supabaseState = await supabaseCheckState(); // required before setDay

                storeMethods.loadSettings();

                storeMethods.toggleDebug(window.ipc.sendSync('debug.state'));
                let today = moment();
                if (state.is_debug) {
                    today.startOf('month').endOf('isoWeek');
                }
                await storeMethods.setDay(today.format("YYYY-MM-DD"), supabaseState);

                storeMethods.setTaskTemplates(window.ipc.sendSync('tasks.getTaskTemplates'));

                storeMethods.setTaskProjects(window.ipc.sendSync('tasks.getTaskProjects'));

                state.initialized = true;

                console.log('state.tasks', state.tasks)
                storeMethods.updateState({initialized: true});
            }
        }

        initialize();
    }, []);

    const contextValue = useMemo<StoreType>((): StoreType => ({
            state: state,
            ...storeMethods,
        }),
        [state, storeMethods],
    );

    return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>
}

export const useStoreContext = (): StoreType => {
    return useContext<StoreType>(StoreContext);
};

export default StoreContentProvider;
