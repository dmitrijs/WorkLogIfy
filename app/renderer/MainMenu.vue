<template>
    <div class="MainMenu">
        <ul>
            <li @click="store.setScreen('tasks')" :class="{ Selected: store.state.screen === 'tasks' }"><span><i class="icofont-tasks"></i> Tasks</span></li>
            <li @click="store.setScreen('active_apps')" :class="{ Selected: store.state.screen === 'active_apps' }"><span><i class="icofont-clock-time"></i> Active Apps</span></li>
            <li @click="store.setScreen('calendar')" :class="{ Selected: store.state.screen === 'calendar' }"><span><i class="icofont-calendar"></i> Calendar</span></li>
            <li @click="store.setScreen('settings')" :class="{ Selected: store.state.screen === 'settings' }"><span><i class="icofont-settings"></i> Settings</span></li>
        </ul>
    </div>
</template>

<script setup lang="ts">
    import store from "./Store/Store";
</script>
