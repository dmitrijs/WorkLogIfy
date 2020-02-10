<template>
    <div class="App" :class="{ isDebug: tasks_ui.is_debug }">
        <transition name="fade" mode="out-in">
            <TasksWindow v-if="tasks_ui.screen === 'tasks'"></TasksWindow>
            <TaskEdit v-if="tasks_ui.screen === 'task.edit'" mode="edit"></TaskEdit>
            <TaskEdit v-if="tasks_ui.screen === 'task.new'" mode="new"></TaskEdit>
            <DayLog v-if="tasks_ui.screen === 'DayLog'"></DayLog>
            <CalendarWindow v-if="tasks_ui.screen === 'calendar'"></CalendarWindow>
            <TemplatesWindow v-if="tasks_ui.screen === 'task.templates'"></TemplatesWindow>
        </transition>

        <div class="Debug" v-if="tasks_ui.is_debug">
            <button onclick="document.location.reload()" style="padding: 10px 20px; float: right">reload</button>
            <button type="button" @click="save()">save</button>
            <div v-for="(value, key) of tasks_ui"><strong>{{key}}:</strong> {{value}}</div>
            <hr/>
            Timer
            <button type="button" @click="timerStop" :disabled="!tasks_ui.timeredId">stop</button>
            <hr/>
            <div v-for="(day, dayId) of tasksGrouped">
                <strong>{{dayId}}</strong><br />
                <div v-for="(val, prop) of day">
                    <template v-if="prop === 'tasks'">
                        <div style="padding-left: 10px;" v-for="(task) of val">
                            <strong>{{task.id}}</strong>
                            {{task}}
                        </div>
                    </template>
                    <div v-else>
                        <em>{{prop}}</em>: {{val}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import TasksWindow from "./Tasks/TasksWindow.vue";
    import DayLog from "./Tasks/DayLog.vue";
    import TaskEdit from "./Tasks/TaskEdit.vue";
    import timer from "./Timer";
    import CalendarWindow from "./Tasks/CalendarWindow.vue";
    import store from "./Store/Store";
    import TemplatesWindow from "./Tasks/TemplatesWindow.vue";

    @Component({
        components: {
            TemplatesWindow,
            CalendarWindow,
            TaskEdit,
            DayLog,
            TasksWindow,
        },
    })
    export default class App extends Vue {
        get tasksGrouped() {
            return store.getters.getTasksGrouped.toJS();
        }

        get tasks_ui() {
            return store.getters.getTasksUi;
        }

        save() {
            window.ipc.sendSync('tasks.save', store.state.day_key, store.state.tasks.toJS(), store.getters.getTasksGrouped.toJS());
        }

        timerStop() {
            timer.stop();
        }
    }
</script>

<style lang="scss">
    .App {
        @import 'App';

        .fade-enter-active, .fade-leave-active {
            transition: opacity .1s;
        }
        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
    }
</style>