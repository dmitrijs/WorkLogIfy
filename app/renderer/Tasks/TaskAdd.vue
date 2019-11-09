<template>
    <div class="TaskAdd">
        <button @click="$store.commit('setScreen', 'tasks')">&lt; back</button><br/>
        <br/>

        <form @submit.prevent="save">
            Code: <input type="text" placeholder="TSKS-0000" v-model="task.code"/><br/>
            Title: <input type="text" v-model="task.title"/><br/>
            Time Spent: <input type="text" v-model="task.time_spent_text" readonly/><br/>
            Date: <input type="text" v-model="task.date_key"/><br/>
            <button>save</button>
        </form>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {now} from "../Utils/Utils";

    @Component({})
    export default class TaskAdd extends Vue {
        task = {
            code: '',
            title: '',
            time_spent_text: '',
            date_key: '',
        };

        mounted() {
            this.task.date_key = now().format('YYYY-MM-DD');
        }

        save() {
            this.$store.commit('createTask', this.task);
        }
    }
</script>

<style scoped lang="scss">
</style>
