<template>
    <div class="TaskEdit" :data-mode="mode">
        <br/>
        <form class="TaskEditForm" @submit.prevent="save()">
            <table style="width: 100%;">
                <tr>
                    <td>Title:</td>
                    <td><input type="text" v-model="task.title" ref="focused"/></td>
                </tr>
                <tr>
                    <td style="width: 100px">Code:</td>
                    <td><input type="text" placeholder="TSKS-0000" v-model="task.code" @keyup="codeChanged()"/>
                    </td>
                </tr>
                <tr>
                    <td>Time Spent:</td>
                    <td class="Complex">
                        <div>
                            <span><strong>{{ task_time_spent_text }}</strong> ({{ task.time_spent_seconds }})</span>
                            <span>Adjust: <input type="text" class="narrow"
                                                 v-model="task.time_add_minutes">m</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Date:</td>
                    <td class="Complex">
                        <div>
                            <span><input type="text" v-model="task.date"/></span>
                            <span>Recorded: <input type="text" class="narrow"
                                                   v-model="task.time_record_minutes">m</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Notes:</td>
                    <td><textarea v-model="task.notes"></textarea></td>
                </tr>
                <tr>
                    <td colspan="2" class="text-right">
                        <button class="btn btn-outline-secondary btn-sm" type="button" @click="back">&lt; back</button>
                        <div class="btn-group" role="group">
                            <button class="btn btn-secondary btn-sm"
                                    :class="{ 'btn-primary': store.state.taskTimeredId === task.id }">
                                {{ mode === 'edit' ? 'update' : 'create' }}
                            </button>
                            <button type="button" class="btn btn-primary btn-sm"
                                    @click="save(true)"
                                    v-if="mode !== 'edit'">
                                <i class="IconAsInput icofont-play"></i>
                            </button>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td><strong>Recorded:</strong></td>
                    <td>
                        <div v-for="rec of task.records">
                            <a target="_blank"
                               v-if="rec.jiraWorkLogId"
                               v-html="formatRecord(rec)"
                               :href="'https://' + store.state.settings.jira_host + '/browse/' + task.code + '?focusedWorklogId=' + rec.jiraWorkLogId"></a>
                            <span v-else v-html="formatRecord(rec)"></span>
                        </div>
                        <div v-if="!task.records || !task.records.length">none</div>
                    </td>
                </tr>
                <tr>
                    <td>Sessions:</td>
                    <td>
                        <div v-for="sess of task.sessions">
                            {{ formatSession(sess) }}
                        </div>
                        <div v-if="!task.sessions || !task.sessions.length">none</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <hr/>
                    </td>
                </tr>
                <tr>
                    <td>Fill in from a template:</td>
                    <td>
                        <div v-for="template of templates" class="Template" @click="fill(template)">
                            {{ template.notes }} <span class="TemplateCode">(<span v-if="template.title">{{ template.title }} / </span>{{ template.code }}<span
                                v-if="template.frozen"> <i class="IconAsInput icofont-unlock"></i></span>)</span>
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
    import timer from "../Timer";

    const moment = require("moment");

    @Component({})
    export default class TaskEdit extends Vue {
        task = {} as TaskEditedObj;

        @Prop({type: String}) mode;

        get store() {
            return store;
        }

        get templates() {
            return store.getters.getTaskTemplates;
        }

        get task_time_spent_text() {
            return timespanToText(this.task.time_spent_seconds);
        }

        created() {
            if (this.mode === 'new') {
                this.task = Object.create(store.getters.getEmptyTask);
            } else {
                this.task = store.getters.getEditedTask;
            }
            this.$set(this.task, 'time_add_minutes', '');
            this.$set(this.task, 'time_record_minutes', '');
        }

        mounted() {
            (this.$refs.focused as HTMLElement).focus();
        }

        save(autostart = false) {
            if (this.mode === 'edit') {
                store.commit.saveTask(this.task);
            } else {
                store.commit.createTask(this.task);
                if (autostart) {
                    timer.start(store.state.createdTaskId);
                }
            }
        }

        fill(template) {
            let forced = false;
            if (this.task.code === template.code) {
                forced = true;
            }
            if (template.title) {
                this.$set(this.task, 'title', template.title);
            }
            if (template.code) {
                this.$set(this.task, 'code', template.code);
            }
            this.$set(this.task, 'frozen', !!template.frozen);
            if (!this.task.notes || forced) {
                this.$set(this.task, 'notes', template.notes);
            }
        }

        back() {
            store.commit.returnToTasksScreen();
        }

        formatSession(sess) {
            let timespan = timespanToText(sess.spent_seconds);
            return `[${sess.method}] ${moment(sess.started_at).format('HH:mm')} -> ${moment(sess.finished_at).format('HH:mm')} = ${timespan}`;
        }

        formatRecord(rec) {
            let timespan = timespanToText(rec.recorded_seconds);
            return `<strong>${timespan}</strong> (${rec.method} at ${moment(rec.created_at).format('HH:mm')})`;
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

    .Template {
        cursor: pointer;
        margin-bottom: 4px;

        .TemplateCode {
            opacity: 0.5;
        }

        &:hover {
            text-decoration: underline;
        }
    }
</style>
