<template>
    <div class="TasksWindow">
        <div class="TRow --header">
            <div class="TCol --selected">
                <div class="label-checkbox" @click="$store.commit('tasksUiToggle', task._key)">
                    <input type="checkbox"><span></span></div>
            </div>
            <div class="TCol --chargeable"><i class="icofont-not-allowed"></i></div>
            <div class="TCol --distributed"><i class="icofont-exchange"></i></div>
            <div class="TCol --frozen"><i class="icofont-unlock"></i></div>
            <div class="TCol --time">Time</div>
            <div class="TCol --code">ID</div>
            <div class="TCol --title">Title</div>
            <div class="TCol --timespan">Time</div>
        </div>
        <div class="TasksTable">
            <template class="TGroup" v-for="(group, date) of tasksGrouped">
                <div class="TRowDate">
                    <div class="TCol --selected"></div>
                    <div class="TCol --frozen"><i class="IconAsInput icofont-wall-clock" :class="{ active: group.logged }"></i></div>
                    <div class="TCol --group-date">{{ date }}</div>
                    <div class="TCol --timespan --timespan-charge" title="Charge">{{ group.time_charge_text }}</div>
                    <div class="TCol --timespan --timespan-spent" title="Spent">{{ group.time_spent_text }}</div>
                </div>

                <div class="TRow"
                     v-for="task of group.tasks"
                     @mouseenter="$store.commit('tasksUiHoveredId', task._key)"
                     :class="{ selected: task._selected, logged: task.logged, hovered: tasks_ui.hoveredId === task._key, timered: tasks_ui.timeredId === task._key }"
                     @click="rowOnClick($event, task)"
                >
                    <div class="TCol --selected">
                        <div class="label-checkbox" @click="$store.commit('tasksUiToggle', task._key)">
                            <input type="checkbox" :checked="task._selected"><span></span></div>
                    </div>
                    <div class="TCol --chargeable">
                        <i class="IconAsInput icofont-not-allowed" :class="{ active: !task.chargeable }" @click="$store.commit('updateTask', [task._key, 'chargeable', !task.chargeable])"></i>
                    </div>
                    <div class="TCol --distributed">
                        <i class="IconAsInput icofont-exchange" :class="{ active: task.distributed }" @click="$store.commit('updateTask', [task._key, 'distributed', !task.distributed])"></i>
                    </div>
                    <div class="TCol --frozen">
                        <i class="IconAsInput icofont-unlock" :class="{ active: task.frozen }" @click="$store.commit('updateTask', [task._key, 'frozen', !task.frozen])"></i>
                    </div>
                    <div class="TCol --time">13:00</div>
                    <div class="TCol --code" @click="editTask($event, task)">{{task.code}}</div>
                    <div class="TCol --title" @click="editTask($event, task)">
                        <span class="Title--Content ellipsis"><span>{{task.title}}</span></span>
                        <span class="Note--Content ellipsis"><span>{{task.notes}}</span></span>
                    </div>
                    <div class="TCol --timespan" @click="editTask($event, task)">
                        <span class="--timespan-charge" title="Charge">
                            {{task.time_charge_text}}
                            <em v-if="tasks_ui.timeredId === task._key">{{ tasks_ui.timerElapsedText }}</em>
                        </span>
                        <span class="--timespan-spent" title="Spent">{{task.time_spent_text}}</span>
                    </div>
                </div>
            </template>
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

    @Component({})
    export default class TasksWindow extends Vue {
        data() {
            return {}
        }

        get tasksGrouped() {
            return this.$store.getters.getTasksGrouped;
        }

        get tasks_ui() {
            return this.$store.getters.getTasksUi;
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
            this.$store.commit('selectHovered');
            e.preventDefault();
            menu.popup({window: remote.getCurrentWindow()})
        }

        rowOnClick($event, task) {
            if ($event.ctrlKey) {
                this.$store.commit('tasksUiToggle', task._key);
            }
        }

        editTask($event, task) {
            this.$store.commit('taskEdit', task._key);
        }
    }
</script>

<style scoped lang="scss">
    .TasksWindow {
        @import "./TasksWindow";
    }
</style>
