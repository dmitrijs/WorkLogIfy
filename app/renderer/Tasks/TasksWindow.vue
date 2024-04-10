<template>
    <div class="TasksWindow" @mousemove="dragContinue($event)" @mouseup="dragStop">
        <div class="DragGhost"
             :style="'left: ' + (drag.nowAt[0] + 6) + 'px; top: ' + (drag.nowAt[1] - 24) + 'px;'"
             v-if="drag.active && drag.distance > 20"
        >
            <span v-if="drag.minutes > 0">{{ drag.minutes_text }}</span>
            <span v-else>cancel</span>
            <LineChart class="progress-bar--no-transition"
                       v-if="drag.minutes > 0"
                       :height="5"
                       :total="drag.taskFrom_minutes"
                       :progress_info="drag.minutes"></LineChart>
        </div>
        <div class="TRow --header">
            <div class="TRowContent">
                <div class="TCol --chargeable"><i class="icofont-not-allowed"></i></div>
                <div class="TCol --distributed"><i class="icofont-exchange"></i></div>
                <div class="TCol --frozen"><i class="icofont-unlock"></i></div>
                <div class="TCol --code">Code</div>
                <div class="TCol --title">Title</div>
                <div class="TCol --frozen"><i class="icofont-unlock"></i></div>
                <div class="TCol --timespan">Time</div>
                <div class="TCol --timespan">
                </div>
            </div>
        </div>
        <div class="TasksTable"
             :class="{ ShowAsReport: tasks_ui.tasksShowAsReport, ShowCompact: tasks_ui.tasksHideUnReportable }"
             :key="forceUpdateKey"
             @click.self="store.deselectAll">
            <div class="TRowDate Total" v-if="tasksGroupedLength > 1">
                <div class="TCol --frozen"></div>
                <div class="TCol --group-date">Total</div>
                <div class="TCol --timespan --timespan-charge">
                    <span title="Charge (Rounded)">{{ total.time_charge_rounded_text }}</span>
                    <span title="Recorded" class="original-time">({{ total.time_recorded_text }})</span>
                </div>
                <div class="TCol --timespan --timespan-spent" title="Spent">{{ total.time_spent_text }}</div>
            </div>
            <template class="TGroup" v-for="(group, date) of tasksGrouped">
                <div class="TRowDate" :class="{ SubTotal: tasksGroupedLength > 1 }">
                    <div class="TCol --frozen"><i class="IconAsInput icofont-wall-clock"></i></div>
                    <div class="TCol --group-date">{{ date }}</div>
                    <div class="TCol --timespan --timespan-charge">
                        <span title="Charge (Rounded)">{{ group.time_charge_rounded_text }}</span>
                        <span title="Recorded" class="original-time">({{ group.time_recorded_text }})</span>
                    </div>
                    <div class="TCol --timespan --timespan-spent" title="Spent">{{ group.time_spent_text }}</div>
                </div>

                <transition-group name="fade">
                    <div class="TRow"
                         v-for="task of group.tasks"
                         @mouseenter="store.tasksUiHoveredId(task.id)"
                         @mouseleave="store.tasksUiHoveredId(null)"
                         :key="task.id"
                         :class="{
                         selected: task._selected, distributed: task.distributed, notchargeable: !task.chargeable,
                         hovered: tasks_ui.hoveredId === task.id,
                         timered: tasks_ui.timeredId === task.id,
                         hasRecords: !!task.time_recorded_seconds,
                         isDone: !!task.is_done,
                         isOnHold: !!task.is_on_hold,
                         isRootTask: (rootTasks[task.code || task.id]?.id === task.id),
                     }"
                         @click="rowOnClick($event, task)"
                    >
                        <div class="TRowContent" v-if="!(tasks_ui.tasksHideUnReportable && (task.distributed || !task.chargeable))">
                            <div class="TCol --chargeable">
                                <i class="IconAsInput icofont-not-allowed" :class="{ active: !task.chargeable }"
                                   @click="store.updateTask([task.id, 'chargeable', !task.chargeable])"></i>
                            </div>
                            <div class="TCol --distributed">
                                <i class="IconAsInput icofont-exchange" :class="{ active: task.distributed }"
                                   @click="store.updateTask([task.id, 'distributed', !task.distributed])"></i>
                            </div>
                            <div class="TCol --frozen">
                                <i class="IconAsInput icofont-unlock" :class="{ active: task.frozen }"
                                   @click="store.updateTask([task.id, 'frozen', !task.frozen])"></i>
                            </div>
                            <div class="TCol --code"
                                 @click="tasks_ui.tasksShowAsReport ? copyToClipboard($event, task.code) : editTask($event, task)">
                                <span v-if="rootTasks[task.code]" style="color: #acacac;">{{ task.code }}</span>
                                <span v-else>{{ task.code }}</span>
                                <div class="--edit-button">
                                    <a href="#" @click.stop="editTask($event, task)" v-if="!task.grouped">edit</a>
                                </div>
                            </div>
                            <div class="TCol --title"
                                 @click="tasks_ui.tasksShowAsReport ? copyToClipboard($event, task.notes) : editTask($event, task)">
                                <span class="Title--Content"
                                      :class="{ ellipsis: !tasks_ui.tasksShowAsReport && !tasks_ui.tasksHideUnReportable }"><span>
                                    <template v-if="task.code !== 'idle' && !task.asanaTaskGid && !rootTasks[task.code]?.asanaTaskGid">❔</template>
                                    {{ task.title || '&nbsp;' }}
                                </span></span>
                                <span class="Note--Content">
                                    <span class="EmptyNotesError" v-if="tasks_ui.tasksShowAsReport && !task.notes">[empty notes]</span>
                                    <span v-else>{{ task.notes || '&nbsp;' }}</span>
                                </span>
                                <span class="Comment--Content" v-if="task.comment">
                                    // {{ task.comment || '&nbsp;' }}
                                </span>
                            </div>
                            <div class="TCol --status">
                                <i class="IconAsInput IconDone icofont-ui-check" :class="{ active: task.is_done }"
                                   @click="store.updateTask([task.id, 'is_done', !task.is_done])"></i>
                                <i class="IconAsInput IconOnHold icofont-sand-clock"
                                   :class="{ active: task.is_on_hold }"
                                   @click="store.updateTask([task.id, 'is_on_hold', !task.is_on_hold])"></i>
                            </div>
                            <div class="TCol --timespan"
                                 @click="dropTime($event, task)"
                                 @mousedown.prevent.stop="dragStart($event, task)"
                                 :title="'Final charge: ' + task.time_charge_text + '\n' + 'Recorded: ' + task.time_recorded_text + '\n' + 'Not recorded: ' + task.time_unrecorded_text"
                            >
                            <span class="--timespan-spent">
                                {{ task.time_spent_text }}
                            </span>
                                <span class="--timespan-charge"
                                      v-if="task.time_recorded_seconds > 0">
                                {{ task.time_unrecorded_text }}
                            </span>
                                <span class="--timespan-final-charge">
                                {{ task.time_charge_text }}
                            </span>
                                <LineChart class="ChartRecorded bg-dark"
                                           :height="3"
                                           :total="task.time_charge_seconds"
                                           :progress_success="task.time_recorded_seconds"></LineChart>
                                <LineChart class="ChartSpent bg-warning"
                                           :height="3"
                                           :total="task.time_charge_seconds"
                                           :progress_normal="task.time_spent_seconds"></LineChart>
                            </div>
                            <div class="TCol --playback">
                                <i class="IconAsInput icofont-square" v-if="tasks_ui.timeredId === task.id"
                                   @click="stopTimer()"></i>
                                <i class="IconAsInput icofont-play" v-if="tasks_ui.timeredId !== task.id"
                                   @click="startTimer($event, task)"></i>
                            </div>
                        </div>
                    </div>
                </transition-group>
            </template>
        </div>
        <CalendarWindow
                :key="store.state.day_key"
                :week-key="store.state.week_key"
        ></CalendarWindow>

        <div class="ViewOptions">
            <a href="#" @click="dragClear" v-if="drag.readyToDrop" style="float: right;">cancel</a>
            Show:
            <span class="label--checkbox label--checkbox--with-text"
                  @click.prevent="toggleShowAsReport()">
                <label><input type="checkbox" :checked="tasks_ui.tasksShowAsReport"><span></span> as a report</label>
            </span>
            <span class="label--checkbox label--checkbox--with-text"
                  @click.prevent="toggleHideUnReportable()">
                <label><input type="checkbox" :checked="tasks_ui.tasksHideUnReportable"><span></span> hide un-reportable</label>
            </span>
            <button type="button" class="btn btn-secondary btn-xs" style="margin-left: 6px; line-height: 0.6rem"
                    title="Ctrl+F applies formatting in Slack"
                    v-if="tasks_ui.tasksShowAsReport || tasks_ui.tasksHideUnReportable"
                    @click="copyToClipboardAllTasks($event)">
                Copy for Slack
            </button>
        </div>
        <div class="Chart" :title="JSON.stringify(total, null, 2)">
            <div class="Total" style="height: 4px; background: #696969">
                <div class="Charge"
                     style="height: 4px; background: #46e148"
                     :style="{ width: 100 * (total.time_charge_rounded_seconds / Math.max(total.time_spent_seconds, store.state.settings.working_day_minutes * 60)) + '%' }"
                >
                    <div class="Distributed"
                         style="height: 2px; background: #b403b4;"
                         :style="{ width: 100 * (total.time_distributed_seconds / total.time_charge_rounded_seconds) + '%' }"
                    >
                    </div>
                </div>
            </div>
            <div class="Total" style="width: 100%; background: #ffadad">
                <div class="WorkingDay" style="height: 3px; background: green"
                     :style="{ width: (store.state.settings.working_day_minutes * 60) / (Math.max(total.time_spent_seconds, store.state.settings.working_day_minutes * 60)) * 100 + '%' }">
                </div>
            </div>
        </div>

        <div class="SelectionStatistics">
            {{ drag }}
        </div>

        <div class="Timeline" ref="timeline">
            <div class="TimelineItems">
                <div style="width: 55px;">
                    <span>8:36</span>
                </div>
                <div style="width: 55px;">
                    <span>9:15</span>
                </div>
                <div style="width: 325px;">
                    <span>9:25</span>
                </div>
                <div style="width: 325px;">
                    <span>15:40</span>
                </div>
                <div style="width: 225px;">
                    <span>18:40</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import moment from "moment";
    import {computed, onBeforeUnmount, onMounted, reactive, ref} from "vue";
    import LineChart from '../Components/LineChart.vue';
    import horizontal_scroller from "../library/horizontal_scroller";
    import store from "../Store/Store";
    import {Store_MergeSameCodes} from "../Store/Store_GetGroupedTasks";
    import timer from "../Timer";
    import {timespanToText, timespanToTextHours} from "../Utils/Utils";
    import CalendarWindow from "./CalendarWindow.vue";
    import createMenu from './TasksMenu';
    import {map, mapValues} from "lodash";

    const remote = window.remote;

    const rootTasks = computed(() => {
        const result = {};
        for (let group of Object.values(tasksGrouped.value)) {
            for (let task of (<any>group).tasks) {
                if (task.code !== 'idle') {
                    result[task.code || task.id] = task;
                }
            }
        }
        return result;
    });

    const drag = reactive({
        active: false,
        readyToDrop: false,
        distance: 0,
        minutes: 0,
        minutes_text: '',
        startedAt: [0, 0],
        nowAt: [0, 0],
        taskFrom: 0,
        taskFrom_minutes: 0,
        taskFrom_minutes_text: '',
        taskTo: 0,
    });

    const forceUpdateKey = ref(1);
    const timeline = ref(null);

    const total = computed(() => {
        let total = {
            time_charge_rounded_seconds: 0,
            time_recorded_seconds: 0,
            time_spent_seconds: 0,
            time_distributed_seconds: 0,
            time_charge_rounded_text: '',
            time_recorded_text: '',
            time_spent_text: '',
            time_distributed_text: '',
        };
        for (let group of Object.values(tasksGrouped.value)) {
            total.time_charge_rounded_seconds += (<any>group).time_charge_rounded_seconds;
            total.time_recorded_seconds += (<any>group).time_recorded_seconds;
            total.time_spent_seconds += (<any>group).time_spent_seconds;
            total.time_distributed_seconds += (<any>group).time_distributed_seconds;
        }
        total.time_charge_rounded_text = timespanToText(total.time_charge_rounded_seconds);
        total.time_recorded_text = timespanToText(total.time_recorded_seconds);
        total.time_spent_text = timespanToText(total.time_spent_seconds);
        total.time_distributed_text = timespanToText(total.time_distributed_seconds);
        return total;
    });

    const tasksGroupedLength = computed(() => {
        return Object.keys(tasksGrouped.value).length;
    });

    const tasksGrouped = computed<Record<string, TaskGroupObj>>(() => {
        let groups = store.getTasksGrouped as Record<string, any>;

        let result = groups;
        if (store.state.tasksShowAsReport) {
            map(groups, (group, date) => {
                result[date].tasks = Store_MergeSameCodes(group.tasks);
            });
        }

        return result;
    });

    const tasksGroupedAndMerged = computed<Record<string, TaskGroupObj>>(() => {
        let groups = store.getTasksGrouped;

        let result = groups;
        map(groups, (group, date) => {
            result[date].tasks = Store_MergeSameCodes(group.tasks);
        });

        return result;
    });

    const tasks_ui = computed(() => {
        return store.getTasksUi;
    })

    onMounted(() => {
        horizontal_scroller(timeline.value);

        window.addEventListener('contextmenu', contextMenuShow, false);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('contextmenu', contextMenuShow);
    });

    function contextMenuShow(e) {
        store.selectHovered();
        e.preventDefault();
        createMenu().popup({window: remote.getCurrentWindow()})
    }

    function rowOnClick($event, task) {
        if ($event.ctrlKey) {
            store.tasksUiToggle(task.id);
        }
    }

    function editTask($event, task) {
        store.taskEdit(task.id);
    }

    function startTimer($event, task) {
        timer.start(task.id);
    }

    function stopTimer() {
        timer.stop();
    }

    function toggleShowAsReport() {
        if (tasks_ui.value.tasksShowAsReport) {
            setTimeout(function () {
                forceUpdateKey.value++; // force reload to remove animation classes
            }.bind(this), 200/* transition 200ms */);
        }
        store.toggleTasksShowAsReport();
    }

    function toggleHideUnReportable() {
        if (tasks_ui.value.tasksHideUnReportable) {
            setTimeout(function () {
                forceUpdateKey.value++; // force reload to remove animation classes
            }.bind(this), 200/* transition 200ms */);
        }
        store.toggleHideUnReportable();
    }

    function copyToClipboard(ev, text) {
        navigator.clipboard.writeText(text).then(function () {
            ev.target.classList.add('AnimationPulseOnceAndHide');
        }, function () {
            /* clipboard write failed */
        });
    }

    function copyToClipboardAllTasks(ev) {
        let s = '*' + moment(store.state.day_key + ' 12:00:00').format('ddd, MMM D') + "*\n";
        for (let group of Object.values(tasksGroupedAndMerged.value)) {
            for (let task of group.tasks) {
                if (!task.chargeable || task.distributed) {
                    continue;
                }
                let title = task.title;
                if (title) {
                    title = title.replaceAll('[combined]', '').trim();
                    title = title.replace(/^, /, '');
                }
                s += title + "\n" + "> " + (task.notes || '') + "\n" + "> ~" + timespanToTextHours(task.time_charge_seconds) + "\n";
            }
        }
        console.log(s);

        navigator.clipboard.writeText(s).then(function () {
            ev.target.classList.add('AnimationPulseOnceAndHide');
        }, function () {
            /* clipboard write failed */
        });
    }

    function dragClear() {
        drag.active = false;
        drag.readyToDrop = false;
        drag.minutes = 0;
        drag.minutes_text = '';
        drag.startedAt = [0, 0];
        drag.nowAt = [0, 0];
        drag.taskFrom = 0;
        drag.taskFrom_minutes = 0;
        drag.taskFrom_minutes_text = '';
        drag.taskTo = 0;
    }

    function dragStart($event, task) {
        if (drag.readyToDrop) {
            return;
        }
        dragClear();

        drag.active = true;
        drag.startedAt = [$event.clientX, $event.clientY];
        drag.nowAt = [$event.clientX, $event.clientY];
        drag.taskFrom = task.id;
        drag.taskFrom_minutes = Math.round(task.time_spent_seconds / 60);
        drag.taskFrom_minutes_text = task.time_spent_seconds_text;
    }

    function dragContinue($event) {
        if (!drag.active) {
            return;
        }
        drag.nowAt = [$event.clientX, $event.clientY];

        let distance = Math.sqrt(
            Math.pow(drag.startedAt[0] - drag.nowAt[0], 2) +
            Math.pow(drag.startedAt[1] - drag.nowAt[1], 2),
        );
        if (!drag.readyToDrop) {
            drag.distance = distance;
            let coefficient = 10.0 / Math.log10(distance);
            drag.minutes = Math.max(0, Math.round(distance / coefficient) - 5);
            drag.minutes = Math.min(drag.minutes, drag.taskFrom_minutes);

            if (drag.nowAt[0] < 80) {
                drag.minutes = 0;
            }
            drag.minutes_text = timespanToText(drag.minutes * 60);
        }
    }

    function dragStop() {
        drag.readyToDrop = drag.minutes > 0;
        drag.active = drag.minutes > 0;

        if (!drag.active) {
            dragClear();
        }
    }

    function dropTime($event, task = null) {
        if (!drag.active || !drag.readyToDrop) {
            return;
        }
        drag.readyToDrop = drag.active = false;
        drag.taskTo = task.id;

        if (drag.minutes > 0 &&
            drag.taskFrom &&
            drag.taskTo &&
            drag.taskFrom !== drag.taskTo) {
            store.taskAddSession([drag.taskFrom, -drag.minutes, 'drag']);
            store.taskAddSession([drag.taskTo, drag.minutes, 'drop']);
        }
        dragClear();
    }
</script>

<style scoped lang="scss">
    .TasksWindow {
        @import "./TasksWindow";

        .--edit-button {
            display: none;
        }

        .label--checkbox--with-text {
            display: inline-block;
            margin: 2px 0px 4px 4px;

            input[type=checkbox] {
                + span {
                    top: 4px;
                }
            }
        }

        .DragGhost {
            position: fixed;
            pointer-events: none;
            background: white;
            padding: 0 4px;
            border-radius: 3px;
            z-index: 10000;
            font-size: 12px;
            border: 1px solid lightgrey;
            min-width: 64px;
            text-align: center;

            .LineChart {
                margin: 0 -4px;
            }
        }

        .EmptyNotesError {
            color: #b30e0d;
        }

        .TRow.distributed,
        .TRow.notchargeable {
            .TRowContent {
                .TCol {
                    .--timespan-spent {
                        opacity: 0.35 !important;
                    }
                }
            }
        }

        .TRow.isDone {
            .TRowContent {
                .TCol {
                    .IconOnHold {
                        display: none;
                    }
                }
            }
        }

        .TRow.notchargeable {
            .TRowContent {
                .TCol {
                    .--timespan-spent {
                        text-decoration: line-through;
                    }
                }
            }
        }

        .TRow {
            transition: all 200ms;

            .TRowContent {
                .TCol.--timespan {
                    .--timespan-spent-unrecorded {
                        display: none;
                    }

                    .--timespan-final-charge {
                        display: none;
                    }
                }

                .TCol.--status {
                    display: flex;
                    flex-direction: column;
                }
            }
        }

        .TRow {
            .TRowContent {
                .TCol {
                    .ChartSpent {
                        opacity: 0 !important;
                    }
                }

                &:hover {
                    .TCol {
                        .ChartSpent {
                            opacity: 1 !important;
                        }
                    }
                }
            }
        }

        .TasksTable.ShowAsReport {
            .--edit-button {
                display: block;
                opacity: 0.5;
            }

            .TRow {
                .TRowContent {
                    margin-bottom: 5px;

                    .TCol.--timespan {
                        .--timespan-spent,
                        .--timespan-charge {
                            display: none;
                        }

                        .--timespan-final-charge {
                            display: block;
                        }
                    }

                    &.notchargeable {
                        opacity: 0.12;
                    }
                }
            }
        }

        .CalendarWindow {
            overflow: initial !important;
            max-height: initial !important;
        }
    }
</style>
