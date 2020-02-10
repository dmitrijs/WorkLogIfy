<template>
    <div class="TaskEdit" :data-mode="mode">
        <br/>
        <form class="TaskEditForm" @submit.prevent="save">
            <table style="width: 100%;">
                <tr>
                    <td width="100">Code:</td>
                    <td><input type="text" placeholder="TSKS-0000" v-model="task.code" ref="task_code" @keyup="codeChanged()"/></td>
                </tr>
                <tr>
                    <td>Title:</td>
                    <td><input type="text" v-model="task.title"/></td>
                </tr>
                <tr>
                    <td>Time Spent:</td>
                    <td class="Complex">
                        <div>
                            <span><strong>{{ task_time_spent_text }}</strong> ({{ task.time_spent_seconds }})</span>
                            <span>Adjust: <input type="text" v-model="task.time_add_minutes">m</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Date:</td>
                    <td><input type="text" v-model="task.date"/></td>
                </tr>
                <tr>
                    <td>Notes:</td>
                    <td><textarea v-model="task.notes"></textarea></td>
                </tr>
                <tr>
                    <td colspan="2" class="text-right">
                        <button class="btn btn-secondary btn-sm" type="button" @click="back">&lt; back</button>
                        <button class="btn btn-primary btn-sm">{{ mode === 'edit' ? 'update' : 'create' }}</button>
                    </td>
                </tr>
                <tr>
                    <td>Sessions:</td>
                    <td>
                        <div v-for="sess of task.sessions">
                            {{ formatSession(sess) }}
                        </div>
                    </td>
                </tr>
            </table>
        </form>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {timespanToText} from "../Utils/Utils";
    import {Prop} from "vue-property-decorator";
    import store from "../Store/Store";

    const moment = require("moment");

    @Component({})
    export default class TaskEdit extends Vue {
        task = {
            code: '',
            title: '',
            time_spent_seconds: 0,
            date: '',
        };

        @Prop({type: String}) mode;

        get editedTask() {
            return store.getters.getEditedTask.toJS();
        }

        get task_time_spent_text() {
            return timespanToText(this.task.time_spent_seconds);
        }

        created() {
            if (this.mode === 'new') {
                this.task.date = store.state.day_key;
            } else {
                this.task = this.editedTask;
            }
            this.$set(this.task, 'time_add_minutes', '');
        }

        mounted() {
            this.$refs.task_code.focus();
        }

        save() {
            if (this.mode === 'edit') {
                store.commit.saveTask(this.task);
            } else {
                store.commit.createTask(this.task);
            }
        }

        back() {
            store.commit.returnToTasksScreen();
        }

        formatSession(sess) {
            let timespan = timespanToText(sess.spent_seconds);
            return `[${sess.method}] ${moment(sess.started_at).format('HH:mm')} -> ${moment(sess.finished_at).format('HH:mm')} = ${timespan}`;
        }

        codeChanged() {
            if (!this.task.code) {
                return;
            }

            let matches = this.task.code.match(/(?:https:\/\/)?[^.]+\.atlassian\.net\/browse\/(\S+-\d+).*?/);
            if (matches) {
                this.$set(this.task, 'code', matches[1]);
            }
        }
    }
</script>

<style scoped lang="scss">
    @import 'TaskEdit';
</style>
