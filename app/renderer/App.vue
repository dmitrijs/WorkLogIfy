<template>
    <div class="App">
        <TasksWindow v-if="tasks_ui.screen === 'tasks'"></TasksWindow>
        <TaskAdd v-if="tasks_ui.screen === 'task.new'"></TaskAdd>
        <DayLog v-if="tasks_ui.screen === 'DayLog'"></DayLog>

        <div class="Debug">
            <button type="button" @click="save()">save</button>
            <button type="button" @click="load()">load</button>
            {{ tasks_ui }}
            <hr />
            {{ $route }}
            <hr/>
            {{ tasksGrouped }}
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import VueRouter from 'vue-router'
    import Component from "vue-class-component";
    import TasksWindow from "./Tasks/TasksWindow.vue";
    import TaskAdd from "./Tasks/TaskAdd.vue";
    import DayLog from "./Tasks/DayLog.vue";

    Vue.use(VueRouter);

    @Component({
        components: {
            DayLog,
            TaskAdd,
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
            window.ipc.sendSync('tasks.save', this.$store.state.tasks.toJSON());
        }

        load() {
        }
    }
</script>

<style lang="scss">
    .App {
        @import 'App';
    }
</style>