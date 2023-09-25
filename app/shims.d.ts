declare type TaskObj = {
    id: string;
    code: string;
    title: string;
    notes: string;
    source: string;
    date: string;
    chargeable: boolean;
    distributed: boolean;
    frozen: boolean;
    is_done: boolean;
    is_done_at: string;
    is_on_hold: boolean;
    is_on_hold_at: boolean;
    _selected: boolean;

    time_spent_text: string;
    time_recorded_text: string;
    time_unrecorded_text: string;
    time_charge_text: string;
    time_charge_extra_text: string;

    time_spent_seconds: number;
    time_recorded_seconds: number;
    time_unrecorded_seconds: number;
    time_charge_seconds: number;
    time_charge_extra_seconds: number;
    time_add_idle_seconds: number;

    timer_elapsed_seconds_text: string;

    sessions: SessionObj[];
    records: RecordObj[];
    activeApps: ActiveAppObj[];
}

declare type TaskEditedObj = TaskObj & {
    time_add_minutes: string;
    time_record_minutes: string;
}

declare type TemplateObj = {
    code?: string;
    title?: string;
    notes?: string;
    frozen?: boolean;
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
    jiraWorkLogId: string;
}

declare type ActiveAppObj = {
    noticed_at: string;
    description: string;
}

declare type SettingsObj = {
    jira_host: string;
    jira_username: string;
    jira_password: string;
    rounding_minutes: number;
    sorting_order: string;
    special_days: Object;
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
