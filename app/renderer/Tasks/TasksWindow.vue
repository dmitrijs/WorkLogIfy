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
                <!--
                <div class="TCol --selected">
                    <div class="label-checkbox">
                        <input type="checkbox"><span></span></div>
                </div>
                -->
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
             :class="{ ShowAsReport: tasks_ui.tasksShowAsReport }"
             :key="forceUpdateKey"
             @click.self="store.commit.deselectAll">
            <template class="TGroup" v-for="(group, date) of tasksGrouped">
                <div class="TRowDate">
                    <!--
                    <div class="TCol --selected"></div>
                    -->
                    <div class="TCol --frozen"><i class="IconAsInput icofont-wall-clock"
                                                  :class="{ active: group.logged }"></i></div>
                    <div class="TCol --group-date">{{ date }}</div>
                    <div class="TCol --timespan --timespan-charge">
                        <span title="Charge (Rounded)">{{ group.time_charge_rounded_text }}</span>
                        <span title="Recorded" class="original-time">({{ group.time_recorded_text }})</span>
                    </div>
                    <div class="TCol --timespan --timespan-spent" title="Spent">{{ group.time_spent_text }}</div>
                </div>

                <transition-group name="fade" mode="out-in">
                    <div class="TRow"
                         v-for="task of group.tasks"
                         @mouseenter="store.commit.tasksUiHoveredId(task.id)"
                         @mouseleave="store.commit.tasksUiHoveredId(null)"
                         :key="task.id"
                         :class="{
                         selected: task._selected, logged: task.logged, distributed: task.distributed, notchargeable: !task.chargeable,
                         hovered: tasks_ui.hoveredId === task.id,
                         timered: tasks_ui.timeredId === task.id,
                         hasRecords: !!task.time_recorded_seconds,
                         isDone: !!task.is_done,
                         isOnHold: !!task.is_on_hold,
                     }"
                         @click="rowOnClick($event, task)"
                    >
                        <div class="TRowContent">
                            <!--
                            <div class="TCol --selected">
                                <div class="label-checkbox" @click="store.commit.tasksUiToggle(task.id)">
                                    <input type="checkbox" :checked="task._selected"><span></span></div>
                            </div>
                            -->
                            <div class="TCol --chargeable">
                                <i class="IconAsInput icofont-not-allowed" :class="{ active: !task.chargeable }"
                                   @click="store.commit.updateTask([task.id, 'chargeable', !task.chargeable])"></i>
                            </div>
                            <div class="TCol --distributed">
                                <i class="IconAsInput icofont-exchange" :class="{ active: task.distributed }"
                                   @click="store.commit.updateTask([task.id, 'distributed', !task.distributed])"></i>
                            </div>
                            <div class="TCol --frozen">
                                <i class="IconAsInput icofont-unlock" :class="{ active: task.frozen }"
                                   @click="store.commit.updateTask([task.id, 'frozen', !task.frozen])"></i>
                            </div>
                            <div class="TCol --code"
                                 @click="tasks_ui.tasksShowAsReport ? copyToClipboard($event, task.code) : editTask($event, task)">
                                {{task.code}}
                                <div class="--edit-button">
                                    <a href="#" @click.stop="editTask($event, task)" v-if="!task.grouped">edit</a>
                                </div>
                            </div>
                            <div class="TCol --title"
                                 @click="tasks_ui.tasksShowAsReport ? copyToClipboard($event, task.notes) : editTask($event, task)">
                        <span class="Title--Content"
                              :class="{ ellipsis: !tasks_ui.tasksShowAsReport }"><span>{{task.title || '&nbsp;'}}</span></span>
                                <span class="Note--Content">
                                <span class="EmptyNotesError" v-if="tasks_ui.tasksShowAsReport && !task.notes">[empty notes]</span>
                                <span v-else>{{task.notes || '&nbsp;'}}</span>

                            </span>
                            </div>
                            <div class="TCol --status">
                                <i class="IconAsInput IconDone icofont-ui-check" :class="{ active: task.is_done }"
                                   @click="store.commit.updateTask([task.id, 'is_done', !task.is_done])"></i>
                                <i class="IconAsInput IconOnHold icofont-sand-clock"
                                   :class="{ active: task.is_on_hold }"
                                   @click="store.commit.updateTask([task.id, 'is_on_hold', !task.is_on_hold])"></i>
                            </div>
                            <div class="TCol --timespan"
                                 @click="dropTime($event, task)"
                                 @mousedown.prevent.stop="dragStart($event, task)"
                                 :title="'Final charge: ' + task.time_charge_text + '\n' + 'Recorded: ' + task.time_recorded_text + '\n' + 'Not recorded: ' + task.time_unrecorded_text"
                            >
                            <span class="--timespan-spent">
                                {{task.time_spent_text}}
                            </span>
                                <span class="--timespan-charge"
                                      v-if="task.time_recorded_seconds > 0">
                                {{task.time_unrecorded_text}}
                            </span>
                                <span class="--timespan-final-charge">
                                {{task.time_charge_text}}
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
                v-if="tasks_ui.tasksShowAsReport"
                :key="store.state.day_key"
                :week-key="store.state.week_key"
        ></CalendarWindow>

        <div class="ViewOptions">
            <a href="#" @click="dragClear" v-if="drag.readyToDrop" style="float: right;">cancel</a>
            Show:
            <span class="label--checkbox label--checkbox--with-text"
                  @click.prevent="toggleShowAsReport()">
                <input type="checkbox" :checked="tasks_ui.tasksShowAsReport"><span></span> as a report
            </span>
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

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import horizontal_scroller from "../library/horizontal_scroller";
    import createMenu from './TasksMenu';
    import LineChart from '../Components/LineChart.vue';
    import store from "../Store/Store";
    import timer from "../Timer";
    import {Store_MergeSameCodes} from "../Store/Store_GetGroupedTasks";
    import {timespanToText} from "../Utils/Utils";
    import CalendarWindow from "./CalendarWindow.vue";

    @Component({
        components: {
            LineChart,
            CalendarWindow,
        }
    })
    export default class TasksWindow extends Vue {
        drag = {
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
        };

        forceUpdateKey = 1;

        data() {
            return {};
        }

        get tasksGrouped() {
            let groups = store.getters.getTasksGrouped;

            let result = groups;
            if (store.state.tasksShowAsReport) {
                groups.map((group, group_id) => {
                    let tasks = Store_MergeSameCodes(group.get('tasks'));
                    result = result.setIn([group_id, 'tasks'], tasks);
                });
            }

            return result.toJS();
        }

        get tasks_ui() {
            return store.getters.getTasksUi;
        }

        get store() {
            return store;
        }

        created() {
        }

        mounted() {
            horizontal_scroller(this.$refs.timeline);

            window.addEventListener('contextmenu', this.contextMenuShow, false);
        }

        beforeDestroy() {
            window.removeEventListener('contextmenu', this.contextMenuShow);
        }

        run() {
            console.log(window.ipc.sendSync('window.open', 'Title 1')) // prints "pong"
        }

        contextMenuShow(e) {
            console.log('in context menu');
            store.commit.selectHovered();
            e.preventDefault();
            createMenu().popup({window: remote.getCurrentWindow()})
        }

        rowOnClick($event, task) {
            if ($event.ctrlKey) {
                store.commit.tasksUiToggle(task.id);
            }
        }

        editTask($event, task) {
            store.commit.taskEdit(task.id);
        }

        startTimer($event, task) {
            timer.start(task.id);
        }

        stopTimer() {
            timer.stop();
        }

        toggleShowAsReport() {
            if (this.tasks_ui.tasksShowAsReport) {
                setTimeout(function () {
                    this.forceUpdateKey++; // force reload to remove animation classes
                }.bind(this), 200/* transition 200ms */);
            }
            store.commit.toggleTasksShowAsReport();
        }

        copyToClipboard(ev, text) {
            navigator.clipboard.writeText(text).then(function () {
                ev.target.classList.add('AnimationPulseOnceAndHide');
            }, function () {
                /* clipboard write failed */
            });
        }

        dragClear() {
            this.drag.active = false;
            this.drag.readyToDrop = false;
            this.drag.minutes = 0;
            this.drag.minutes_text = '';
            this.drag.startedAt = [0, 0];
            this.drag.nowAt = [0, 0];
            this.drag.taskFrom = 0;
            this.drag.taskFrom_minutes = 0;
            this.drag.taskFrom_minutes_text = '';
            this.drag.taskTo = 0;
        }

        dragStart($event, task) {
            if (this.drag.readyToDrop) {
                return;
            }
            this.dragClear();

            this.drag.active = true;
            this.drag.startedAt = [$event.clientX, $event.clientY];
            this.drag.nowAt = [$event.clientX, $event.clientY];
            this.drag.taskFrom = task.id;
            this.drag.taskFrom_minutes = Math.round(task.time_spent_seconds / 60);
            this.drag.taskFrom_minutes_text = task.time_spent_seconds_text;
        }

        dragContinue($event) {
            if (!this.drag.active) {
                return;
            }
            this.drag.nowAt = [$event.clientX, $event.clientY];

            let distance = Math.sqrt(
                Math.pow(this.drag.startedAt[0] - this.drag.nowAt[0], 2) +
                Math.pow(this.drag.startedAt[1] - this.drag.nowAt[1], 2)
            );
            if (!this.drag.readyToDrop) {
                this.drag.distance = distance;
                let coefficient = 10.0 / Math.log10(distance);
                this.drag.minutes = Math.max(0, Math.round(distance / coefficient) - 5);
                this.drag.minutes = Math.min(this.drag.minutes, this.drag.taskFrom_minutes);

                if (this.drag.nowAt[0] < 80) {
                    this.drag.minutes = 0;
                }
                this.drag.minutes_text = timespanToText(this.drag.minutes * 60);
            }
        }

        dragStop() {
            this.drag.readyToDrop = this.drag.minutes > 0;
            this.drag.active = this.drag.minutes > 0;

            if (!this.drag.active) {
                this.dragClear();
            }
        }

        dropTime($event, task = null) {
            if (!this.drag.active || !this.drag.readyToDrop) {
                return;
            }
            this.drag.readyToDrop = this.drag.active = false;
            this.drag.taskTo = task.id;

            if (this.drag.minutes > 0 &&
                this.drag.taskFrom &&
                this.drag.taskTo &&
                this.drag.taskFrom !== this.drag.taskTo) {
                store.commit.taskAddSession([this.drag.taskFrom, -this.drag.minutes, 'drag']);
                store.commit.taskAddSession([this.drag.taskTo, this.drag.minutes, 'drop']);
            }
            this.dragClear();
        }
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
                height: 18px;

                .TCol {
                    .ChartRecorded,
                    .ChartSpent,
                    .IconOnHold,
                    .Note--Content,
                    .--edit-button,
                    .--timespan-charge {
                        display: none;
                    }

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

                    .Title--Content {
                        opacity: 0.5;
                    }

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
