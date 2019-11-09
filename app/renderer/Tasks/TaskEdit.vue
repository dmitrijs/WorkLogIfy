<template>
    <div class="TaskEdit">
        <button @click="$store.commit('setScreen', 'tasks')">&lt; back</button><br/>
        <br/>

        <form @submit.prevent="save">
            Code: <input type="text" placeholder="TSKS-0000" v-model="task.code"/><br/>
            Title: <input type="text" v-model="task.title"/><br/>
            Time Spent: <input type="text" v-model="task.time_spent_seconds" readonly/><br/>
            Date: <input type="text" v-model="task.date"/><br/>
            <textarea v-model="task.notes"></textarea>
            <button>update</button>
        </form>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {now} from "../Utils/Utils";

    @Component({})
    export default class TaskEdit extends Vue {
        get task() {
            return this.$store.getters.getEditedTask.toJS();
        }

        mounted() {
            this.task.date_key = now().format('YYYY-MM-DD');
        }

        save() {
            this.$store.commit('saveTask', this.task);
        }
    }
</script>

<style scoped lang="scss">
</style>
