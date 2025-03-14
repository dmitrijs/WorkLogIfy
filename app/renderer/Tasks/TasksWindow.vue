<template>
    <div class="TasksWindow" @mousemove="dragContinue($event)" @mouseup="dragStop">
        <div class="DragGhost"
             :style="'left: ' + (store.state.drag.nowAt[0] + 6) + 'px; top: ' + (store.state.drag.nowAt[1] - 24) + 'px;'"
             v-if="store.state.drag.active && store.state.drag.distance > 20"
        >
            <span v-if="store.state.drag.minutes > 0">{{ store.state.drag.minutes_text }}</span>
            <span v-else>cancel</span>
            <LineChart class="progress-bar--no-transition"
                       v-if="store.state.drag.minutes > 0"
                       :height="5"
                       :total="store.state.drag.taskFrom_minutes"
                       :progress_info="store.state.drag.minutes"></LineChart>
        </div>
        <div class="TRow --header">
            <div class="TRowContent">
                <div class="TCol --hierarchy"><i class="icofont-rounded-down"></i></div>
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
             :class="{ ShowAsReport: store.state.tasksShowAsReport, ShowCompact: store.state.tasksHideUnReportable }"
             :key="forceUpdateKey"
             @click.self="store.deselectAll">
            <div class="TRowDate Total" v-if="tasksGroupedLength > 1">
                <div class="TCol --frozen"></div>
                <div class="TCol --group-date">Total</div>
                <div class="TCol --timespan --timespan-charge">
                    <span title="Charge (Not distributed)">{{ timespanToText(total.time_not_distributed_seconds) }}</span>
                    &nbsp;
                    <span title="Charge (Rounded)">{{ total.time_charge_rounded_text }}</span>
                    <span title="Recorded" class="original-time" v-if="total.time_recorded_text !== '-'"> ({{ total.time_recorded_text }})</span>
                    &nbsp;
                    <span title="Spent">{{ total.time_spent_text }}</span>
                </div>
            </div>
            <template class="TGroup" v-for="(group, date) of tasksGrouped">
                <div class="TRowDate"
                     :class="{
                        SubTotal: tasksGroupedLength > 1,
                        Erroneous: group.erroneous,
                        TimeredGroup: (store.state.tasks[store.state.taskTimeredId]?.date === date),
                     }">
                    <div class="TCol --frozen"><i class="IconAsInput icofont-wall-clock"></i></div>
                    <div class="TCol --group-date">{{ date }}</div>
                    <div class="TCol --timespan --timespan-charge">
                        <span title="Charge (Not distributed)">{{ timespanToText(group.time_not_distributed_seconds) }}</span>
                        &nbsp;
                        <span title="Charge (Rounded)">{{ group.time_charge_rounded_text }}</span>
                        <span title="Recorded" class="original-time" v-if="group.time_recorded_text !== '-'"> ({{ group.time_recorded_text }})</span>
                        &nbsp;
                        <span title="Spent">{{ group.time_spent_text }}</span>
                    </div>
                </div>

                <transition-group name="fade">
                    <template v-for="(task, task_id) of group.tasks" :key="task.id">
                        <TaskRow :tasksGrouped="tasksGrouped"
                                 :group_id="date"
                                 :task_id="task_id"
                                 v-if="!task.parentId || store.parentIsMissing(task)"
                                 @drag_start="dragStart"></TaskRow>
                    </template>
                </transition-group>
            </template>
        </div>

        <div>
            <textarea class="GlobalNotes" rows="1"
                      ref="globalNotesInput"
                      v-model="store.state.settings.global_notes"
                      @blur="store.updateSettings(store.state.settings)">
                [AskMA] Copy stored credit card when user registers from Horoscope email
            </textarea>
        </div>

        <CalendarWindow
                :key="store.state.day_key"
                :week-key="store.state.week_key"
        ></CalendarWindow>

        <div class="ViewOptions">
            <a href="#" @click="store.dragClear" v-if="store.state.drag.readyToDrop" style="float: right;">cancel</a>
            View as report:
            <span class="label--checkbox label--checkbox--with-text"
                  @click.prevent="toggleShowAsReport()">
                <label><input type="checkbox" :checked="store.state.tasksShowAsReport"><span></span> merge codes</label>
            </span>
            <span class="label--checkbox label--checkbox--with-text"
                  @click.prevent="toggleHideUnReportable()">
                <label><input type="checkbox" :checked="store.state.tasksHideUnReportable"><span></span> hide un-reportable</label>
            </span>
            <button type="button" class="btn btn-xs" style="margin-left: 6px; padding: 0px 8px;"
                    title="Copy for Slack. NOTE: Ctrl+F applies formatting in Slack"
                    @click="copyToClipboardAllTasks($event)">
                <i class="icofont-copy"></i>
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
            {{ store.state.drag }}
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
    import {map} from "lodash";
    import moment from "moment";
    import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
    import LineChart from '../Components/LineChart.vue';
    import horizontal_scroller from "../library/horizontal_scroller";
    import store from "../Store/Store";
    import {Store_MergeSameCodes} from "../Store/Store_GetGroupedTasks";
    import {timespanToText, timespanToTextHours} from "../Utils/Utils";
    import CalendarWindow from "./CalendarWindow.vue";
    import TaskRow from "./TaskRow.vue";
    import createMenu from './TasksMenu';

    const remote = window.remote;

    const forceUpdateKey = ref(1);
    const timeline = ref(null);
    const globalNotesInput = ref(null);

    const total = computed<TaskGroupObj>(() => {
        let total = <TaskGroupObj>{
            tasks: {},
            time_charge_rounded_seconds: 0,
            time_recorded_seconds: 0,
            time_spent_seconds: 0,
            time_distributed_seconds: 0,
            time_charge_rounded_text: '',
            time_recorded_text: '',
            time_spent_text: '',
            time_distributed_text: '',

            time_not_distributed_seconds: 0,
            time_charge_seconds: 0,
            time_charge_text: '',
            duplicatesExist: null,
        };
        for (let group of Object.values(tasksGrouped.value)) {
            total.time_charge_rounded_seconds += group.time_charge_rounded_seconds;
            total.time_recorded_seconds += group.time_recorded_seconds;
            total.time_spent_seconds += group.time_spent_seconds;
            total.time_distributed_seconds += group.time_distributed_seconds;
            total.time_not_distributed_seconds += group.time_not_distributed_seconds;
            total.time_charge_seconds += group.time_charge_seconds;
        }
        total.time_charge_rounded_text = timespanToText(total.time_charge_rounded_seconds);
        total.time_recorded_text = timespanToText(total.time_recorded_seconds);
        total.time_spent_text = timespanToText(total.time_spent_seconds);
        total.time_distributed_text = timespanToText(total.time_distributed_seconds);
        total.time_charge_text = timespanToText(total.time_charge_seconds);
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

    onMounted(() => {
        horizontal_scroller(timeline.value);
        adjustNotesHeight();

        window.addEventListener('contextmenu', contextMenuShow, false);
    });

    onBeforeUnmount(() => {
        window.removeEventListener('contextmenu', contextMenuShow);
    });

    watch(() => store.state.settings.global_notes, () => {
        adjustNotesHeight();
    })

    function adjustNotesHeight() {
        if (!globalNotesInput.value) {
            return;
        }
        globalNotesInput.value.style.height = "";
        globalNotesInput.value.style.height = Math.min(50, globalNotesInput.value.scrollHeight) + "px";
    }

    function contextMenuShow(e) {
        store.selectHovered();
        e.preventDefault();
        createMenu().popup({window: remote.getCurrentWindow()})
    }

    function toggleShowAsReport() {
        if (store.state.tasksShowAsReport) {
            setTimeout(function () {
                forceUpdateKey.value++; // force reload to remove animation classes
            }.bind(this), 200/* transition 200ms */);
        }
        store.toggleTasksShowAsReport();
    }

    function toggleHideUnReportable() {
        if (store.state.tasksHideUnReportable) {
            setTimeout(function () {
                forceUpdateKey.value++; // force reload to remove animation classes
            }.bind(this), 200/* transition 200ms */);
        }
        store.toggleHideUnReportable();
    }

    function copyToClipboardAllTasks(ev) {
        let s = '*' + moment(store.state.day_key + ' 12:00:00').format('ddd, MMM D') + "*\n";
        for (let group of Object.values(tasksGroupedAndMerged.value)) {
            for (let task of Object.values(group.tasks)) {
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

    function dragStart($event, task) {
        if (store.state.drag.readyToDrop) {
            return;
        }
        store.dragClear();

        store.state.drag.active = true;
        store.state.drag.startedAt = [$event.clientX, $event.clientY];
        store.state.drag.nowAt = [$event.clientX, $event.clientY];
        store.state.drag.taskFrom = task.id;
        store.state.drag.taskFrom_minutes = Math.round(task.time_spent_seconds / 60);
        store.state.drag.taskFrom_minutes_text = task.time_spent_seconds_text;
    }

    function dragContinue($event) {
        if (!store.state.drag.active) {
            return;
        }
        store.state.drag.nowAt = [$event.clientX, $event.clientY];

        let distance = Math.sqrt(
            Math.pow(store.state.drag.startedAt[0] - store.state.drag.nowAt[0], 2) +
            Math.pow(store.state.drag.startedAt[1] - store.state.drag.nowAt[1], 2),
        );
        if (!store.state.drag.readyToDrop) {
            store.state.drag.distance = distance;
            let coefficient = 10.0 / Math.log10(distance);
            store.state.drag.minutes = Math.max(0, Math.round(distance / coefficient) - 5);
            store.state.drag.minutes = Math.min(store.state.drag.minutes, store.state.drag.taskFrom_minutes);

            if (store.state.drag.nowAt[0] < 80) {
                store.state.drag.minutes = 0;
            }
            store.state.drag.minutes_text = timespanToText(store.state.drag.minutes * 60);
        }
    }

    function dragStop() {
        store.state.drag.readyToDrop = store.state.drag.minutes > 0;
        store.state.drag.active = store.state.drag.minutes > 0;

        if (!store.state.drag.active) {
            store.dragClear();
        }
    }
</script>

<style lang="scss">
    .TasksWindow {
        & {
            display: flex;
            flex-direction: column;
            height: calc(100% - var(--main-menu-height));
        }

        .TasksTable {
            overflow-y: scroll;
            flex-grow: 1;
        }

        & {
            .TRow {
                &:nth-child(2n) {
                    background: #fcfcfc;
                }

                .TRowContent:hover {
                    padding: 0;
                    border: 1px solid #d5d5d5;

                    .TCol.--playback .IconAsInput.icofont-play {
                        display: block;
                    }
                }

                &.selected {
                    background-color: #f0f0f0 !important;
                }

                &.--header {
                    padding: 1px 0 3px 0;

                    .TCol {
                        font-weight: bold;
                    }
                }

                &.notchargeable,
                &.distributed {
                    > .TRowContent {
                        background-color: #f1f1f1;

                        * {
                            color: gray;
                        }
                    }
                }

                .TRowContent {
                    display: grid;
                    grid-template-columns: 22px 22px 22px 22px 73px 1fr 22px 63px 34px;
                    grid-template-rows: auto;

                    margin: 0px 1px;
                    padding: 1px;
                }

                &.isSubtask {
                    padding-left: 22px;

                    .TRowContent {
                        grid-template-columns: 22px 22px 22px 73px 1fr 22px 63px 34px; // without first column
                        border-left: 1px dashed #c2c2c2 !important;
                        padding-left: 0;
                    }

                    .TCol.--hierarchy {
                        display: none;
                    }
                }

                &.isMissingParent {
                    background-color: #ffcaca !important;
                }

                .TCol {
                    padding: 1px 3px;

                    &.--code {
                        white-space: nowrap;
                    }

                    &.--time {
                        color: #364abc;
                    }

                    &.--hierarchy,
                    &.--selected,
                    &.--distributed,
                    &.--chargeable,
                    &.--frozen {
                        align-self: center;
                        text-align: center;
                    }

                    &.--timespan {
                        align-self: center;

                        .--timespan-charge {
                            opacity: 0.5;
                        }
                    }

                    &.--title {
                        .Comment--Content,
                        .Note--Content,
                        .Title--Content {
                            display: block;
                            word-break: break-word;
                        }
                    }

                    .Title--Content {
                        font-weight: bold;
                    }

                    .Comment--Content {
                        color: grey;
                        line-height: 0.8rem;
                        padding-top: 2px;
                        padding-bottom: 2px;
                    }

                    &.--timespan {
                        span {
                            display: block;
                        }
                    }

                    &.--playback {
                        align-self: center;
                    }
                }

                &.timered > .TRowContent {
                    background-color: #ebffeb !important;
                    border: 1px solid #2fbb26;
                    padding: 0;
                }
            }

            .TasksTable { // not header
                .TCol.--code,
                .TCol.--title,
                .TCol.--timespan {
                    cursor: pointer;
                }
            }

            .TasksTable:not(.ShowAsReport) {
                .TRow.isOnHold {
                    background: #fffef2;

                    .IconOnHold {
                        color: #E9D086 !important;
                        opacity: 0.4 !important;
                    }

                    .TCol.--playback {
                        .IconOnHold.active {
                            background-color: transparent;
                            font-size: 1.5rem;
                            line-height: 0.7rem;
                            opacity: 1 !important;
                        }
                    }

                    .TCol.--playback:hover .IconOnHold,
                    .TCol.--playback:not(:hover) .hidden {
                        display: none;
                    }
                }

                .TRow.isDone {
                    background-color: #fafffa;

                    .IconDone {
                        color: #94CC94;
                    }
                    &:not(.timered) .IconDone {
                        opacity: 0.4 !important;
                    }

                    .TCol.--playback {
                        .IconDone.active {
                            background-color: transparent;
                            font-size: 1.5rem;
                            line-height: 0.7rem;
                            opacity: 1 !important;
                        }
                    }

                    .TCol.--playback:not(:hover) .hidden {
                        display: none;
                    }
                    &.timered .TCol.--playback,
                    .TCol.--playback:hover {
                        .hidden {
                            display: block;
                        }
                        .IconDone {
                            display: none;
                        }
                    }
                }
            }

            .TasksTable.ShowAsReport {
                .TCol.--status {
                    opacity: 0;
                }
            }

            .TRowDate {
                display: grid;
                grid-template-columns: 22px 1fr 215px 22px;
                grid-template-rows: auto;

                padding: 2px 0px;
                color: #364abc;

                .TCol {
                    padding: 1px 3px;

                    &.--timespan {
                        text-align: right;
                    }

                    &.--group-date {
                        position: relative;

                        &:after {
                            position: absolute;
                            content: "";
                            display: block;
                            height: 1px;
                            width: 64%;
                            background: #b8c1f1;
                            top: 9px;
                            right: 5px;
                        }
                    }

                    &.--timespan-charge {
                        .original-time {
                            opacity: 0.5;
                        }
                    }

                    &.--timespan-spent {
                        opacity: 0.5;
                    }
                }

                &.Total {
                    .TCol.--group-date {
                        &:after {
                            width: 82%;
                        }
                    }
                }

                &.SubTotal {
                    color: #a9b5f1;
                }
            }

        }

        .SelectionStatistics {
            background: white;
            padding: 4px 6px;
            border-top: 1px solid grey;
            border-radius: 3px;
        }

        [class*=" icofont-"],
        [class^=icofont-] {
            font-size: 17px;
        }

        .TRow {
            .TRowContent {
                .IconAsInput {
                    opacity: 0.1;
                    cursor: pointer;

                    &.active {
                        opacity: 1 !important;
                    }
                }

                .TCol.--playback {
                    .IconAsInput {
                        background: #e2e2e2;
                        opacity: 1 !important;
                        font-size: 13px;
                        border-radius: 14px;
                        color: white;
                        display: inline-block;
                        width: 28px;
                        height: 28px;
                        text-align: center;
                        padding-top: 9px;

                        &.icofont-square {
                            background: #4db34d !important;
                            color: white !important;
                        }
                    }
                }
            }

            &:not(.timered) {
                .TCol.--playback {
                    .IconAsInput:hover {
                        background: #74b874;
                    }
                }
            }
        }

        .TRowContent:hover {
            .IconAsInput {
                opacity: 0.3;

                &:hover {
                    opacity: 0.5;
                }
            }
        }

        .Timeline {
            height: 52px;
            overflow-x: scroll;
            flex-shrink: 0;
        }

        .TimelineItems {
            width: auto;
            height: 40px;
            display: flex;
            padding: 3px;

            > div {
                height: 40px;
            }

            &:hover {
                > div {
                    flex-shrink: 0;
                }
            }
        }

        .ellipsis {
            position: relative;
        }

        .ellipsis:before {
            content: 'X';
            visibility: hidden;
        }

        .ellipsis span {
            position: absolute;
            left: 0;
            right: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .ShowCompact {
            .TRow.isRootTask:not(.isDone):not(.distributed) {
                border-bottom: 1px solid #999999;
            }
        }

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
            > .TRowContent {
                .TCol {
                    .--timespan-spent {
                        opacity: 0.35 !important;
                    }
                }
            }
        }

        .TRow.isDone {
            > .TRowContent {
                .TCol {
                    .IconOnHold {
                        display: none;
                    }
                }
            }
        }

        .TRow.notchargeable {
            > .TRowContent {
                .TCol {
                    .--timespan-spent {
                        text-decoration: line-through;
                    }
                }
            }
        }

        .TRow {
            transition: all 200ms;

            > .TRowContent {
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

        .TRowDate.TimeredGroup {
            color: #74c95c;

            .TCol.--group-date:after {
                background: #74c95c;
            }
        }

        .TRowDate.Erroneous {
            color: #f55353;

            .TCol.--group-date:after {
                background: #f55353;
            }
        }

        .GlobalNotes {
            width: 100%;
            border-color: #cbcbcb;
            font-style: italic;
            resize: none;
        }
    }
</style>
