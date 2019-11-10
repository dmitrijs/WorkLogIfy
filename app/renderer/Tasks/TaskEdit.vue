<template>
    <div class="TaskEdit" :data-mode="mode">
        <button class="btn btn-secondary btn-sm" @click="$store.commit('setScreen', 'tasks')">&lt; back</button>
        <br/>
        <br/>

        <form class="TaskEditForm" @submit.prevent="save">
            <table style="width: 100%;">
                <tr>
                    <td width="100">Code:</td>
                    <td><input type="text" placeholder="TSKS-0000" v-model="task.code"/></td>
                </tr>
                <tr>
                    <td>Title:</td>
                    <td><input type="text" v-model="task.title"/></td>
                </tr>
                <tr>
                    <td>Time Spent:</td>
                    <td class="Complex">
                        <div><input type="text" v-model="task.time_spent_seconds"/> + <input type="text" v-model="task.time_add_minutes">m</div>
                    </td>
                </tr>
                <tr>
                    <td>Date:</td>
                    <td><input type="text" v-model="task.date"/></td>
                </tr>
                <tr>
                    <td>Notes:</td>
                    <td><textarea v-model="task.notes"></textarea></td>
                </tr>
            </table>
            <button class="btn btn-secondary btn-sm">{{ mode === 'edit' ? 'update' : 'create' }}</button>
        </form>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import {now} from "../Utils/Utils";

    @Component({
        props: {
            mode: String,
        },
    })
    export default class TaskEdit extends Vue {
        task = {
            code: '',
            title: '',
            time_spent_seconds: 0,
            date: '',
        };

        get editedTask() {
            return this.$store.getters.getEditedTask.toJS();
        }

        created() {
            if (this.mode === 'new') {
                this.task.date = now().format('YYYY-MM-DD');
            } else {
                this.task = this.editedTask;
            }
            this.$set(this.task, 'time_add_minutes', 0);
        }

        save() {
            if (this.mode === 'edit') {
                this.$store.commit('saveTask', this.task);
            } else {
                this.$store.commit('createTask', this.task);
            }
        }
    }
</script>

<style scoped lang="scss">
    @import 'TaskEdit';
</style>
