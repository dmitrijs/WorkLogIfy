<template>
    <div class="DayLog">
        <template v-for="(group, date) of tasksGrouped">
            <div>
                Date: {{ date }} -
                <span title="Charge">{{ group.time_charge_text }} chargeable</span>
                <span title="Spent">({{ group.time_spent_text }} total)</span>
            </div>

            <div class="TRow"
                 v-for="task of group.tasks"
                 v-show="task.chargeable && !task.distributed"
            >
                <div class="Code">
                    <div class="Code--Content" @click="copyToClipboard($event, task.code)">{{task.code}}</div>
                    <a href="#" @click.prevent="editTask($event, task)">edit</a>
                </div>

                <div class="Description">
                    <div>
                        <div class="Title--Content">{{task.title}}</div>
                        <div class="Note--Content"
                             @click="copyToClipboard($event, task.notes)">{{task.notes || '---'}}
                        </div>
                    </div>
                    <div>
                        <span class="--timespan-charge" title="Charge">
                            {{task.time_charge_text}}
                        </span>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";

    @Component({})
    export default class DayLog extends Vue {
        data() {
            return {}
        }

        get tasksGrouped() {
            return store.getters.getTasksGrouped;
        }

        copyToClipboard(ev, text) {
            navigator.clipboard.writeText(text).then(function () {
                ev.target.classList.add('AnimationPulseOnceAndHide');
            }, function () {
                /* clipboard write failed */
            });
        }

        editTask($event, task) {
            store.commit.taskEdit(task.id);
        }
    }
</script>

<style scoped lang="scss">
    .DayLog {
        @import "./DayLog";
    }
</style>
