<template>
    <div class="App" :class="{ isDebug: store.state.is_debug }">
        <div class="AppScreen">
            <MainMenu></MainMenu>

            <transition name="fade" mode="out-in">
                <TasksWindow v-if="store.state.screen === 'tasks'"></TasksWindow>
                <TaskEdit v-else-if="store.state.screen === 'task.edit'" mode="edit" key="task.edit"></TaskEdit>
                <TaskEdit v-else-if="store.state.screen === 'task.new'" mode="new" key="task.new"></TaskEdit>
                <TodosWindow v-else-if="store.state.screen === 'todo'" key="todo"></TodosWindow>
                <CalendarWindow v-else-if="store.state.screen === 'calendar'"></CalendarWindow>
                <TemplatesWindow v-else-if="store.state.screen === 'task.templates'"></TemplatesWindow>
                <SettingsWindow v-else-if="store.state.screen === 'settings'"></SettingsWindow>
                <ActiveAppsWindow v-else-if="store.state.screen === 'active_apps'"></ActiveAppsWindow>
            </transition>
        </div>

        <div class="Debug" v-if="store.state.is_debug">





            <button onclick="document.location.reload()" class="btn btn-secondary" style="padding: 10px 20px; float: right">reload</button>
            <button type="button" class="btn btn-secondary btn-xs" @click="save()">save</button>
            <template v-for="(value, key) of store.state">
                <div v-if="!value || typeof value !== 'object'"><strong>{{ key }}:</strong> {{ value }}</div>
            </template>

            <hr />
            Integrations:
            <button type="button" class="btn btn-secondary btn-xs" @click="lock()">lock</button>
            <button type="button" class="btn btn-secondary btn-xs" @click="wakeup()">wake up</button><br />
            Timer:
            <button type="button" class="btn btn-secondary btn-xs" @click="timerStop" :disabled="!store.state.taskTimeredId">stop</button>
            <hr />
            Progress:
            <button type="button" class="btn btn-secondary btn-xs" @click="progressBar({indeterminate: true})">∞</button>
            <button type="button" class="btn btn-secondary btn-xs" @click="progressBar({indeterminate: false})">-</button>
            <button type="button" class="btn btn-secondary btn-xs" @click="progressBar({progress: 0.01})">1%</button>
            <button type="button" class="btn btn-secondary btn-xs" @click="progressBar({progress: 0.70})">70%</button>
            <hr />
            <div v-for="(day, dayId) of tasksGrouped">
                <strong>{{ dayId }}</strong><br />
                <div v-for="(val, prop) of day">
                    <template v-if="(<any>prop) === 'tasks'">
                        <div style="padding-left: 10px;" v-for="(task) of val">
                            <strong>{{ task.id }}</strong>
                            <div style="white-space: pre;">{{ task }}</div>
                        </div>
                    </template>
                    <div v-else>
                        <em>{{ prop }}</em>: {{ val }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-facing-decorator";
    import store from "./Store/Store";
    import ActiveAppsWindow from "./Tasks/ActiveAppsWindow.vue";
    import CalendarWindow from "./Tasks/CalendarWindow.vue";
    import SettingsWindow from "./Tasks/SettingsWindow.vue";
    import TaskEdit from "./Tasks/TaskEdit.vue";
    import TasksWindow from "./Tasks/TasksWindow.vue";
    import TemplatesWindow from "./Tasks/TemplatesWindow.vue";
    import TodosWindow from "./Tasks/TodosWindow.vue";
    import timer from "./Timer";
    import MainMenu from "./MainMenu.vue";

    @Component({
        components: {
            TodosWindow,
            ActiveAppsWindow,
            TemplatesWindow,
            CalendarWindow,
            TaskEdit,
            TasksWindow,
            SettingsWindow,
            MainMenu,
        },
    })
    export default class App extends Vue {
        get tasksGrouped() {
            return store.getTasksGrouped;
        }

        get store() {
            return store;
        }

        save() {
            store.saveTasks();
        }

        lock() {
            window.ipc.send('integrations.lock');
        }
        wakeup() {
            window.ipc.send('integrations.wakeup');
        }

        timerStop() {
            timer.stop();
        }

        progressBar(params: { progress?: number, indeterminate?: boolean }) {
            window.ipc.send('set.progress', params);
        }
    }
</script>

<style lang="scss">
    .App {
        height: 100%;
        overflow: hidden;

        outline: 1px solid black;

        display: flex;

        --main-menu-height: 29px;

        .App {
            &:not(.isDebug) {
                .Timeline,
                .SelectionStatistics {
                    display: none !important;
                }
            }
        }

        .AnimationPulseOnceAndHide {
            animation: AnimationPulseOnceAndHide linear .5s;
            opacity: 0.5;
        }

        @keyframes AnimationPulseOnceAndHide {
            0% {
                transform: none;
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: none;
            }
        }

        .Debug {
            position: absolute;
            left: 510px;
            top: 5px;
            width: 280px;
            z-index: 111;
        }

        .btn-xs {
            font-size: .675rem;
            line-height: 1.3;
        }

        .btn-danger {
            background-color: #ad2d39;
            border-color: #ad2d39;
        }

        .AppScreen {
            width: 500px;
        }

        .fade-enter-active, .fade-leave-active {
            transition: opacity .1s;
        }

        .fade-enter, .fade-leave-to {
            opacity: 0;
        }
    }
</style>