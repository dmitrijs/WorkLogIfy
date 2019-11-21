declare module '*.vue' {
    import Vue from 'vue';
    export default Vue;
}

declare type Task = {
    id: string;
    code: string;
    title: string;
    notes: string;
}
