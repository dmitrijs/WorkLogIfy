<template>
    <div class="TasksWindow">
        <div class="TRow --header">
            <div class="TCol --selected">
                <div class="label-checkbox" @click="store.commit.tasksUiToggle(task.id)">
                    <input type="checkbox"><span></span></div>
            </div>
            <div class="TCol --chargeable"><i class="icofont-not-allowed"></i></div>
            <div class="TCol --distributed"><i class="icofont-exchange"></i></div>
            <div class="TCol --frozen"><i class="icofont-unlock"></i></div>
            <div class="TCol --code">Code</div>
            <div class="TCol --title">Title</div>
            <div class="TCol --timespan">Time</div>
        </div>
        <div class="TasksTable" :class="{ ShowAsReport: tasks_ui.tasksShowAsReport }">
            <template class="TGroup" v-for="(group, date) of tasksGrouped">
                <div class="TRowDate">
                    <div class="TCol --selected"></div>
                    <div class="TCol --frozen"><i class="IconAsInput icofont-wall-clock"
                                                  :class="{ active: group.logged }"></i></div>
                    <div class="TCol --group-date">{{ date }}</div>
                    <div class="TCol --timespan --timespan-charge" title="Charge">
                        {{ group.time_charge_rounded_text }}
                        <span class="original-time">({{ group.time_charge_text }})</span>
                    </div>
                    <div class="TCol --timespan --timespan-spent" title="Spent">{{ group.time_spent_text }}</div>
                </div>

                <div class="TRow"
                     v-for="task of group.tasks"
                     @mouseenter="$store.direct.commit.tasksUiHoveredId(task.id)"
                     :key="task.id + forceUpdateKey"
                     :class="{
                         selected: task._selected, logged: task.logged, distributed: task.distributed, notchargeable: !task.chargeable,
                         hovered: tasks_ui.hoveredId === task.id,
                         timered: tasks_ui.timeredId === task.id,
                         hasRecords: !!task.time_recorded_seconds,
                     }"
                     @click="rowOnClick($event, task)"
                >
                    <div class="TCol --selected">
                        <div class="label-checkbox" @click="$store.direct.commit.tasksUiToggle(task.id)">
                            <input type="checkbox" :checked="task._selected"><span></span></div>
                    </div>
                    <div class="TCol --chargeable">
                        <i class="IconAsInput icofont-not-allowed" :class="{ active: !task.chargeable }"
                           @click="$store.direct.commit.updateTask([task.id, 'chargeable', !task.chargeable])"></i>
                    </div>
                    <div class="TCol --distributed">
                        <i class="IconAsInput icofont-exchange" :class="{ active: task.distributed }"
                           @click="$store.direct.commit.updateTask([task.id, 'distributed', !task.distributed])"></i>
                    </div>
                    <div class="TCol --frozen">
                        <i class="IconAsInput icofont-unlock" :class="{ active: task.frozen }"
                           @click="$store.direct.commit.updateTask([task.id, 'frozen', !task.frozen])"></i>
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
                              :class="{ ellipsis: !tasks_ui.tasksShowAsReport }"><span>{{task.title}}</span></span>
                        <span class="Note--Content "
                              :class="{ ellipsis: !tasks_ui.tasksShowAsReport }"><span>{{task.notes}}</span></span>
                    </div>
                    <div class="TCol --timespan" @click="editTask($event, task)"
                         :title="'Final charge: ' + task.time_charge_text + '\n' + 'Recorded: ' + task.time_recorded_text + '\n' + 'Not recorded: ' + task.time_unrecorded_text"
                    >
                        <span class="--timespan-spent">
                            {{task.time_spent_text}}
                            <LineChart class="bg-warning"
                                       v-if="task.time_charge_extra_seconds > 0"
                                       :height="3"
                                       :total="task.time_charge_seconds"
                                       :progress_normal="task.time_spent_seconds"></LineChart>
                            <LineChart class="bg-dark"
                                       v-if="task.time_recorded_seconds > 0"
                                       :height="3"
                                       :total="task.time_charge_seconds"
                                       :progress_success="task.time_recorded_seconds"></LineChart>
                        </span>
                        <span class="--timespan-charge"
                              v-if="task.time_charge_extra_seconds > 0">
                            {{task.time_unrecorded_text}}
                        </span>
                        <span class="--timespan-final-charge">
                            {{task.time_charge_text}}
                        </span>
                    </div>
                    <div class="TCol --playback">
                        <i class="IconAsInput icofont-ui-play-stop" v-if="tasks_ui.timeredId === task.id"
                           @click="stopTimer()"></i>
                        <i class="IconAsInput icofont-ui-play" v-if="tasks_ui.timeredId !== task.id"
                           @click="startTimer($event, task)"></i>
                    </div>
                </div>
            </template>
        </div>

        <div>
            <div class="label--checkbox label--checkbox--with-text"
                 @click.prevent="toggleShowAsReport()">
                <input type="checkbox" :checked="tasks_ui.tasksShowAsReport"><span></span> show as report
            </div>
        </div>

        <div class="SelectionStatistics">
            Statistics!
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
    import menu from './TasksMenu';
    import LineChart from '../Components/LineChart.vue';
    import store from "../Store/Store";
    import timer from "../Timer";
    import {Store_MergeSameCodes} from "../Store/Store_GetGroupedTasks";

    @Component({
        components: {
            LineChart,
        }
    })
    export default class TasksWindow extends Vue {
        data() {
            return {
                forceUpdateKey: 1,
            };
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
            menu.popup({window: remote.getCurrentWindow()})
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
    }
</script>

<style scoped lang="scss">
    .TasksWindow {
        @import "./TasksWindow";

        .--edit-button {
            display: none;
        }

        .label--checkbox--with-text {
            margin: 2px 0px 4px 4px;

            input[type=checkbox] {
                + span {
                    top: 4px;
                }
            }
        }

        .TRow.distributed,
        .TRow.notchargeable {
            height: 18px;

            .TCol {
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

        .TRow.notchargeable {
            .TCol {
                .--timespan-spent {
                    text-decoration: line-through;
                }
            }
        }

        .TRow {
            transition: all 200ms;

            .TCol.--timespan {
                .--timespan-spent-unrecorded {
                    display: none;
                }

                .--timespan-final-charge {
                    display: none;
                }
            }
        }

        .TRow.hasRecords {
            .TCol {
                .--timespan-spent-total {
                    display: none !important;
                }
            }

            &:hover {
                .TCol {
                    .--timespan-spent-unrecorded {
                        display: none;
                    }

                    .--timespan-spent-total {
                        display: inline !important;
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
</style>
