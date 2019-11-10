<template>
    <div class="TaskEdit" :data-mode="mode">
        <div class="text-right">
            <button class="btn btn-secondary btn-sm" @click="$store.commit('setScreen', 'tasks')">&lt; back</button>
        </div>
        <br/>

        <form class="TaskEditForm" @submit.prevent="save">
            <table style="width: 100%;">
                <tr>
                    <td width="100">Code:</td>
                    <td><input type="text" placeholder="TSKS-0000" v-model="task.code"/></td>
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
                    <td colspan="2" class="text-right"><button class="btn btn-secondary btn-sm">{{ mode === 'edit' ? 'update' : 'create' }}</button></td>
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
    import {now, timespanToText} from "../Utils/Utils";

    const moment = require("moment");

    @Component({
        props: {
            mode: String,
        },
    })
    export default class TaskEdit extends Vue {
        task = {
            code: '',
            title: '',
            time_spent_seconds: 0,
            date: '',
        };

        get editedTask() {
            return this.$store.getters.getEditedTask.toJS();
        }

        get task_time_spent_text() {
            return timespanToText(this.task.time_spent_seconds);
        }

        created() {
            if (this.mode === 'new') {
                this.task.date = now().format('YYYY-MM-DD');
            } else {
                this.task = this.editedTask;
            }
            this.$set(this.task, 'time_add_minutes', 0);
        }

        save() {
            if (this.mode === 'edit') {
                this.$store.commit('saveTask', this.task);
            } else {
                this.$store.commit('createTask', this.task);
            }
        }

        formatSession(sess) {
            let timespan = timespanToText(sess.spent_seconds);
            return `[${sess.method}] ${moment(sess.started_at).format('HH:mm')} -> ${moment(sess.finished_at).format('HH:mm')} = ${timespan}`;
        }
    }
</script>

<style scoped lang="scss">
    @import 'TaskEdit';
</style>
