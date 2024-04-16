<template>
    <div class="TRow"
         @mouseenter="store.tasksUiHoveredId(task.id)"
         @mouseleave="store.tasksUiHoveredId(null)"
         :key="task.id"
         :class="{
             selected: task._selected, distributed: task.distributed, notchargeable: !task.chargeable,
             hovered: store.state.tasksHoveredId === task.id,
             timered: store.state.taskTimeredId === task.id,
             hasRecords: !!task.time_recorded_seconds,
             isDone: !!task.is_done,
             isOnHold: !!task.is_on_hold,
             isRootTask: (rootTasks[task.code || task.id]?.id === task.id),
         }"
         @click="rowOnClick($event, task)"
    >
        <div class="TRowContent" v-if="!(store.state.tasksHideUnReportable && (task.distributed || !task.chargeable))">
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
                 @click="store.state.tasksShowAsReport ? copyToClipboard($event, task.code) : editTask($event, task)">
                <span v-if="rootTasks[task.code]" style="color: #acacac;">{{ task.code }}</span>
                <span v-else>{{ task.code }}</span>
                <div class="--edit-button">
                    <a href="#" @click.stop="editTask($event, task)" v-if="!task.grouped">edit</a>
                </div>
            </div>
            <div class="TCol --title"
                 @click="store.state.tasksShowAsReport ? copyToClipboard($event, task.notes) : editTask($event, task)">
                                <span class="Title--Content"
                                      :class="{ ellipsis: !store.state.tasksShowAsReport && !store.state.tasksHideUnReportable }"><span>
                                    <template v-if="task.code !== 'idle' && !task.asanaTaskGid && !rootTasks[task.code]?.asanaTaskGid">❔</template>
                                    {{ task.title || '&nbsp;' }}
                                </span></span>
                <span class="Note--Content">
                                    <span class="EmptyNotesError" v-if="store.state.tasksShowAsReport && !task.notes">[empty notes]</span>
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
                 @mousedown.prevent.stop="emit('drag_start', $event, task)"
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
                <i class="IconAsInput icofont-square" v-if="store.state.taskTimeredId === task.id"
                   @click="stopTimer()"></i>
                <i class="IconAsInput icofont-play" v-if="store.state.taskTimeredId !== task.id"
                   @click="startTimer($event, task)"></i>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import store from "../Store/Store";
    import LineChart from '../Components/LineChart.vue';
    import {computed} from "vue";
    import timer from "../Timer";

    const props = defineProps<{
        tasksGrouped: Record<string, TaskGroupObj>,
        group_id: string,
        task_index: number,
    }>();

    const emit = defineEmits(['drag_start']);

    const task = computed(() => {
        return props.tasksGrouped[props.group_id].tasks[props.task_index];
    })

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

    const rootTasks = computed(() => {
        const result = {};
        for (let group of Object.values(props.tasksGrouped)) {
            for (let task of (<any>group).tasks) {
                if (task.code !== 'idle') {
                    result[task.code || task.id] = task;
                }
            }
        }
        return result;
    });

    function copyToClipboard(ev, text: string) {
        navigator.clipboard.writeText(text).then(function () {
            ev.target.classList.add('AnimationPulseOnceAndHide');
        }, function () {
            /* clipboard write failed */
        });
    }

    function dropTime($event, task = null) {
        if (!store.state.drag.active || !store.state.drag.readyToDrop) {
            return;
        }
        store.state.drag.readyToDrop = store.state.drag.active = false;
        store.state.drag.taskTo = task.id;

        if (store.state.drag.minutes > 0 &&
            store.state.drag.taskFrom &&
            store.state.drag.taskTo &&
            store.state.drag.taskFrom !== store.state.drag.taskTo) {
            store.taskAddSession([store.state.drag.taskFrom, -store.state.drag.minutes, 'store.state.drag']);
            store.taskAddSession([store.state.drag.taskTo, store.state.drag.minutes, 'drop']);
        }
        store.dragClear();
    }
</script>

<style lang="scss">
</style>
