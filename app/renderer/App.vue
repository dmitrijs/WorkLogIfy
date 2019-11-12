<template>
    <div class="App" :class="{ isDebug: tasks_ui.is_debug }">
        <transition name="fade" mode="out-in">
            <TasksWindow v-if="tasks_ui.screen === 'tasks'"></TasksWindow>
            <TaskEdit v-if="tasks_ui.screen === 'task.edit'" mode="edit"></TaskEdit>
            <TaskEdit v-if="tasks_ui.screen === 'task.new'" mode="new"></TaskEdit>
            <DayLog v-if="tasks_ui.screen === 'DayLog'"></DayLog>
            <CalendarWindow v-if="tasks_ui.screen === 'calendar'"></CalendarWindow>
        </transition>

        <div class="Debug" v-if="tasks_ui.is_debug">
            <button onclick="document.location.reload()" style="padding: 10px 20px; float: right">reload</button>
            <button type="button" @click="save()">save</button>
            <div v-for="(value, key) of tasks_ui"><strong>{{key}}:</strong> {{value}}</div>
            <hr/>
            Timer
            <button type="button" @click="timerStop" :disabled="!tasks_ui.timeredId">stop</button>
            <hr/>
            {{ tasksGrouped }}
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

    @Component({
        components: {
            CalendarWindow,
            TaskEdit,
            DayLog,
            TasksWindow,
        },
    })
    export default class App extends Vue {
        get tasksGrouped() {
            return this.$store.getters.getTasksGrouped;
        }

        get tasks_ui() {
            return this.$store.getters.getTasksUi;
        }

        save() {
            window.ipc.sendSync('tasks.save', this.$store.state.day_key, this.$store.state.tasks.toJSON());
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