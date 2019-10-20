<template>
    <div class="App">
        <router-view></router-view>

        <div class="Debug">
            {{ tasks_ui }}
            <hr/>
            {{ tasksGrouped }}
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import VueRouter from 'vue-router'

    Vue.use(VueRouter);

    export default class App extends Vue {
        run() {
            console.log('app');
        }

        get tasksGrouped() {
            return this.$store.getters.getTasksGrouped;
        }

        get tasks_ui() {
            return this.$store.getters.getTasksUi;
        }
    }
</script>

<style lang="scss">
    .App {
        @import 'App';
    }
</style>