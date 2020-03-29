declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare type TaskObj = {
    id: string;
    code: string;
    title: string;
    notes: string;
    date: string;
    chargeable: boolean;
    distributed: boolean;
    frozen: boolean;
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

    timer_elapsed_seconds_text: string;

    sessions: SessionObj[];
    records: RecordObj[];
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
}
