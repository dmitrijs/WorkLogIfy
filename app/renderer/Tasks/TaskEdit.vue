<template>
    <div class="TaskEdit">
        <form @submit.prevent="save">
            Code: <input type="text" placeholder="TSKS-0000" v-model="task.code"/><br/>
            Title: <input type="text" v-model="task.title"/><br/>
            Time Spent: <input type="text" v-model="task.time_spent_seconds" readonly/><br/>
            Date: <input type="text" v-model="task.date"/><br/>
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
            this.$store.commit('createTask', this.task);
        }
    }
</script>

<style scoped lang="scss">
</style>
