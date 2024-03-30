<template>
    <div class="App" :class="{ isDebug: tasks_ui.is_debug }">
        <transition name="fade" mode="out-in">
            <TasksWindow v-if="tasks_ui.screen === 'tasks'"></TasksWindow>
            <TaskEdit v-else-if="tasks_ui.screen === 'task.edit'" mode="edit" key="task.edit"></TaskEdit>
            <TaskEdit v-else-if="tasks_ui.screen === 'task.new'" mode="new" key="task.new"></TaskEdit>
            <TodosWindow v-else-if="tasks_ui.screen === 'todo'" key="todo"></TodosWindow>
            <CalendarWindow v-else-if="tasks_ui.screen === 'calendar'"></CalendarWindow>
            <TemplatesWindow v-else-if="tasks_ui.screen === 'task.templates'"></TemplatesWindow>
            <SettingsWindow v-else-if="tasks_ui.screen === 'settings'"></SettingsWindow>
            <ActiveAppsWindow v-else-if="tasks_ui.screen === 'active_apps'"></ActiveAppsWindow>
        </transition>

        <div class="Debug" v-if="tasks_ui.is_debug">
            <button onclick="document.location.reload()" class="btn btn-secondary" style="padding: 10px 20px; float: right">reload</button>
            <button type="button" class="btn btn-secondary btn-xs" @click="save()">save</button>
            <div v-for="(value, key) of tasks_ui"><strong>{{key}}:</strong> {{value}}</div>
            <hr/>
            Timer
            <button type="button" class="btn btn-secondary btn-xs" @click="timerStop" :disabled="!tasks_ui.timeredId">stop</button>
            <hr/>
            <div v-for="(day, dayId) of tasksGrouped">
                <strong>{{dayId}}</strong><br />
                <div v-for="(val, prop) of day">
                    <template v-if="(<any>prop) === 'tasks'">
                        <div style="padding-left: 10px;" v-for="(task) of val">
                            <strong>{{task.id}}</strong>
                            <div style="white-space: pre;">{{task}}</div>
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
    import {Component, Vue} from "vue-facing-decorator";
    import ActiveAppsWindow from "./Tasks/ActiveAppsWindow.vue";
    import TasksWindow from "./Tasks/TasksWindow.vue";
    import TaskEdit from "./Tasks/TaskEdit.vue";
    import TodosWindow from "./Tasks/TodosWindow.vue";
    import timer from "./Timer";
    import CalendarWindow from "./Tasks/CalendarWindow.vue";
    import store from "./Store/Store";
    import TemplatesWindow from "./Tasks/TemplatesWindow.vue";
    import SettingsWindow from "./Tasks/SettingsWindow.vue";

    @Component({
        components: {
            TodosWindow,
          ActiveAppsWindow,
            TemplatesWindow,
            CalendarWindow,
            TaskEdit,
            TasksWindow,
            SettingsWindow,
        },
    })
    export default class App extends Vue {
        get tasksGrouped() {
            return store.getTasksGrouped;
        }

        get tasks_ui() {
            return store.getTasksUi;
        }

        save() {
            store.saveTasks();
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