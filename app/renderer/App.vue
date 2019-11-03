<template>
    <div class="App">
        <router-view></router-view>

        <div class="Debug">
            <button type="button" @click="save()">save</button>
            <button type="button" @click="load()">load</button>
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