<template>
    <div class="CalendarWindow">
        <button
                v-for="file of allFiles"
                @click="open(file)">
            {{ file }}
        </button>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import horizontal_scroller from "../library/horizontal_scroller";
    import menu from './TasksMenu';
    import store from "../Store/Store";

    @Component({})
    export default class CalendarWindow extends Vue {
        data() {
            return {}
        }

        get allFiles() {
            return this.$store.getters.getAllFiles;
        }

        open(day) {
            store.commit('setDay', day);
            store.commit('setScreen', 'tasks');
        }
    }
</script>

<style scoped lang="scss">
</style>
