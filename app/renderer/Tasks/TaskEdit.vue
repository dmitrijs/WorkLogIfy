<template>
    <div class="TaskEdit" :data-mode="mode">
        <br />
        <form class="TaskEditForm" @submit.prevent="save()">
            <table style="width: 100%;">
                <tr>
                    <td>Title:</td>
                    <td><input type="text" v-model="task.title" ref="focused" /></td>
                </tr>
                <tr>
                    <td>Asana task (<a href="#" @click.prevent="store.loadAsanaTasks(true)"><i class="icofont-refresh"></i></a>):</td>
                    <td>
                        <select v-model="task.asanaTaskGid" @change="asanaTaskChanged()">
                            <option value=""></option>
                            <option :value="task.asanaTaskGid" v-if="!store.state.asanaTasks?.[task.asanaTaskGid]">Current: {{ task.asanaTaskGid }}</option>
                            <template v-for="(tasks, groupName) of asanaTasks">
                                <optgroup :label="String(groupName)">
                                    <template v-for="task of tasks">
                                        <option :value="task.gid">{{ task.completed_at ? '[✓] ' : '' }}{{ task.name }}</option>
                                    </template>
                                </optgroup>
                            </template>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td style="width: 100px">Code:</td>
                    <td class="Complex">
                        <div style="margin-right: 11px;">
                            <span>
                                <input type="text" placeholder="TSKS-0000" v-model="task.code" @keyup="codeChanged()" />
                                <button class="btn btn-xs"
                                        type="button"
                                        :class="{
                                            ['btn-outline-secondary']: task.code !== 'idle',
                                            ['btn-secondary']: task.code === 'idle',
                                        }"
                                        style="padding: 1px 8px;display: block;float: right;position: relative;top: 1px;"
                                        @click.prevent="task.code = 'idle'"
                                >idle</button>
                            </span>
                            <span>From: <input type="text" class="narrow"
                                               v-model="task.source"></span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Time Spent:</td>
                    <td class="Complex">
                        <div>
                            <span><strong>{{ task_time_spent_text }}</strong> ({{ task.time_spent_seconds }})</span>
                            <span :style="{ fontWeight: task.taskIdExtractedFrom ? 'bold' : '' }">
                                {{ task.taskIdExtractedFrom ? 'Extract' : 'Adjust' }}:
                                <input type="text" class="narrow" v-model="task.time_add_minutes">m
                            </span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>Date:</td>
                    <td class="Complex">
                        <div>
                            <span><input type="text" v-model="task.date" /></span>
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
                    <td>Comment:</td>
                    <td><input type="text" v-model="task.comment" /></td>
                </tr>
                <tr>
                    <td>Parent task:</td>
                    <td><select v-model="task.parentId">
                        <option :value="null"></option>
                        <template v-for="parentTask of store.state.tasks">
                            <option v-if="parentTask.id !== task.id && !parentTask.parentId" :value="parentTask.id">
                                <template v-if="parentTask.code">[{{ parentTask.code }}]</template>
                                {{ parentTask.title }}
                                <template v-if="parentTask.notes"> ({{ parentTask.notes }})</template>
                            </option>
                        </template>
                    </select></td>
                </tr>
                <tr>
                    <td colspan="2">
                        <button class="btn btn-outline-secondary btn-sm" type="button" @click="back">&lt; back</button>
                        <div class="btn-group float-right" role="group">
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
                        <div style="max-height: 100px; overflow: auto;">
                            <div v-for="sess of task.sessions">
                                {{ formatSession(sess) }}
                            </div>
                        </div>
                        <div v-if="!task.sessions || !task.sessions.length">none</div>
                    </td>
                </tr>
                <tr>
                    <td>Active apps:</td>
                    <td>
                        <div style="max-height: 100px; overflow: auto; max-width: 400px; white-space: nowrap;">
                            <div v-for="activeApp of task.activeApps">
                                {{ formatActiveApp(activeApp) }}
                            </div>
                        </div>
                        <div v-if="!task.activeApps?.length">none</div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <hr />
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

<script lang="ts">
    import _ from "lodash";
    import moment from "moment";
    import {Component, Prop, Vue} from "vue-facing-decorator";
    import store from "../Store/Store";
    import timer from "../Timer";
    import {timespanToText} from "../Utils/Utils";

    @Component({})
    export default class TaskEdit extends Vue {
        task = {} as TaskEditedObj;

        @Prop({type: String}) mode;

        get store() {
            return store;
        }

        get templates() {
            return store.getTaskTemplates;
        }

        get task_time_spent_text() {
            return timespanToText(this.task.time_spent_seconds);
        }

        get asanaTasks() {
            return _.groupBy(store.state.asanaTasks, 'assignee_section.name');
        }

        created() {
            if (this.mode === 'new') {
                this.task = {...store.getEmptyTask};
            } else {
                this.task = {...store.getEditedTask, time_add_minutes: '', time_record_minutes: ''};
            }
        }

        mounted() {
            (this.$refs.focused as HTMLElement).focus();
        }

        save(autostart = false) {
            if (this.mode === 'edit') {
                store.saveTask(this.task);
            } else {
                store.createTask(this.task);
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
                this.task = {...this.task, title: template.title};
            }
            if (template.code) {
                this.task = {...this.task, code: template.code};
            }
            this.task = {...this.task, frozen: !!template.frozen};
            if (!this.task.notes || forced) {
                this.task = {...this.task, notes: template.notes};
            }
        }

        back() {
            store.returnToTasksScreen();
        }

        formatSession(sess) {
            let timespan = timespanToText(sess.spent_seconds);
            return `[${sess.method}] ${moment(sess.started_at).format('HH:mm')} -> ${moment(sess.finished_at).format('HH:mm')} = ${timespan}`;
        }

        formatRecord(rec) {
            let timespan = timespanToText(rec.recorded_seconds);
            return `<strong>${timespan}</strong> (${rec.method} at ${moment(rec.created_at).format('HH:mm')})`;
        }

        formatActiveApp(activeApp) {
            return `[${moment(activeApp.noticed_at).format('HH:mm:ss')}] ${activeApp.description}`;
        }

        codeChanged() {
            if (!this.task.code) {
                return;
            }

            let matches = this.task.code.match(/(?:https:\/\/)?[^.]+\.atlassian\.net\/browse\/(\S+-\d+).*?/);
            if (matches) {
                this.task = {...this.task, code: matches[1]};
            }
        }

        asanaTaskChanged() {
            if (!this.task.asanaTaskGid || !store.state.asanaTasks[this.task.asanaTaskGid]) {
                return;
            }
            const asanaTask = store.state.asanaTasks[this.task.asanaTaskGid];
            this.task = {...this.task, title: asanaTask.name};
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
