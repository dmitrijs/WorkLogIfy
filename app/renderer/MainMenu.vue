<template>
    <div class="MainMenu">
        <ul>
            <li @click="store.setScreen('tasks')"
                :class="{ Selected: store.state.screen === 'tasks' }"
            ><span><i class="icofont-tasks"></i> Tasks</span></li>
            <li @click="store.setScreen('active_apps')"
                :class="{ Selected: store.state.screen === 'active_apps' }"
            ><span><i class="icofont-clock-time"></i> Active Apps</span></li>
            <li @click="store.setScreen('calendar')"
                :class="{ Selected: store.state.screen === 'calendar' }"
            ><span><i class="icofont-calendar"></i> Calendar</span></li>
            <li @click="store.setScreen('settings')"
                :class="{ Selected: store.state.screen === 'settings' }"
            ><span><i class="icofont-settings"></i> Settings</span></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
    import store from "./Store/Store";
</script>

<style lang="scss">
    .MainMenu {
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            border-bottom: 1px solid #e6e6e6;
        }

        li {
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            height: 28px;
            line-height: 24px;

            &:hover {
                background: #eee;
            }

            &.Selected {
                background: #e2e2e2;
            }
        }
    }
</style>
