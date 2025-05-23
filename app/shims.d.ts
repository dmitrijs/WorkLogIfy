declare type WorkDayObj = {
    tasks: any;
    activeApps: ActiveAppObj[];
}

declare type TaskObj = {
    id: string;
    code: string;
    title: string;
    notes: string;
    comment: string;
    source: string;
    date: string;
    chargeable: boolean;
    distributed: boolean;
    frozen: boolean;
    is_done?: boolean;
    is_done_at?: string;
    is_on_hold?: boolean;
    is_on_hold_at?: boolean;
    created_at: string;
    parentId: string;

    time_spent_text?: string;
    time_recorded_text?: string;
    time_unrecorded_text?: string;
    time_charge_text?: string;
    time_charge_extra_text?: string;

    time_spent_seconds?: number;
    time_recorded_seconds?: number;
    time_unrecorded_seconds?: number;
    time_charge_seconds?: number;
    time_charge_extra_seconds?: number;
    time_add_idle_seconds?: number;

    timer_elapsed_seconds_text?: string;

    sessions: SessionObj[];
    records: RecordObj[];
    activeApps: ActiveAppObj[];
    subtaskIds?: string[];

    asanaTaskGid?: string;
    youtrackTaskCode?: string;
    taskIdExtractedFrom?: string; // id of task from which current task was extracted

    group_key?: string;
    grouped?: boolean;
}

declare type TaskGroupObj = {
    tasks: Record<string, TaskObj>,
    time_charge_seconds: number,
    time_spent_seconds: number,
    time_distributed_seconds: number,
    time_not_distributed_seconds: number,
    time_frozen_seconds: number,
    time_charge_text: string,
    time_spent_text: string,
    time_recorded_text: string,
    time_recorded_seconds?: number,
    time_distributed_text?: string,

    duplicatesExist: boolean,
    time_charge_rounded_seconds: number,
    time_charge_rounded_text: string,

    erroneous?: boolean;
}

declare type TaskEditedObj = TaskObj & {
    time_add_minutes: string;
    time_record_minutes: string;
}

declare type TemplateObj = {
    code?: string;
    title?: string;
    notes?: string;
    comment?: string;
    frozen?: boolean;
    chargeable?: boolean;
    distributed?: boolean;
}

declare type SessionObj = {
    spent_seconds: number;
    method: string;
    started_at: string;
    finished_at: string;
}

declare type RecordObj = {
    recorded_seconds: number;
    method: string;
    created_at: string;
    jiraWorkLogId?: string;
}

declare type ActiveAppObj = {
    noticed_at: string;
    description: string;
    seconds_idle: number;
    timered_task?: string;
}

declare type SettingsObj = {
    jira_host: string;
    jira_username: string;
    jira_password: string;
    asana_token: string;
    youtrack_domain: string;
    youtrack_token: string;
    youtrack_query: string;
    asana_assignee_id: string;
    asana_assignee_name: string;
    asana_workspace_id: string;
    asana_workspace_name: string;
    asana_extra_filter: string;
    rounding_minutes: number;
    working_day_minutes: number;
    sorting_order: string;
    special_days: object;
    global_notes: string;
    connected_devices_wake_up: boolean;
    connected_devices_open_dashboard: boolean;
    asana_enabled: boolean;
    youtrack_enabled: boolean;
}

declare type CalendarStatistics = {
    days: { [key: string]: CalendarDayStatistics },
    months: { [key: string]: CalendarMonthStatistics },
    weeks: { [key: string]: CalendarWeekStatistics },
}

declare type CalendarDayStatistics = {
    dayCode: string,
    weekCode: string,
    monthLastWeekCode: string,
    monthName: string,
    title: string,
    isOpened: boolean,
    isFirstDayOfTheMonth: boolean,
    isToday: boolean,
    isWeekend: boolean,
    isCurrentMonth: boolean,
    expectedHours: number,
    paid: boolean,
    charged_seconds: any,
    charged_seconds_text: any,
}

declare type CalendarWeekStatistics = {
    days: string[],
    week_charged: number,
    week_charged_text: string,
}

declare type CalendarMonthStatistics = {
    month_charged_seconds: number,
    month_charged_seconds_text: string,
    month_title: string,
    month_official_seconds: number,
    month_overtime_seconds: number,
    month_overtime_text: string,
}

declare type AsanaWorkspaceObj = {
    gid: string;
    name: string;
}

declare type AsanaTaskObj = {
    gid: string;
    name: string;
    permalink_url: string;
    completed_at?: string;
    assignee_section?: { name: string };
}

declare type YoutrackTaskObj = {
    customFields: any[],
    idReadable,
    summary,
    description,

    AsanaID: string;
    Assignee: string;
    Estimation: string;
    Note: string;
    Original_estimation: string;
    Priority: string;
    Spent_time: string;
    State: string;
}

declare type ShellResult = {
    code: number;
    stdout: string;
    stderr: string;
}

declare type AndroidState = {
    screenOn: boolean;
    screenUnlocked: boolean;
}
