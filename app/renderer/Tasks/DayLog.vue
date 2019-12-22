<template>
    <div class="DayLog">
        <template v-for="(group, date) of tasksGrouped">
            <div>
                Date: {{ date }} -
                <span title="Charge">{{ group.time_charge_rounded_text }} ({{ group.time_charge_text }}) to charge, </span>
                <span title="Spent">{{ group.time_spent_text }} total</span>
            </div>

            <div class="TRow"
                 v-for="task of group.tasks"
                 v-show="task.chargeable && !task.distributed"
            >
                <div class="Code" :class="{ combined: !task.id }">
                    <div class="Code--Content" @click="copyToClipboard($event, task.code)">{{task.code}}</div>
                    <a href="#" @click.prevent="editTask($event, task)" v-if="task.id">edit</a>
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

        <button type="button" @click="combineSameCodes = !combineSameCodes">{{ combineSameCodes ? 'show original' : 'combine same codes' }}</button>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";
    import {Store_MergeSameCodes} from "../Store/Store_GetGroupedTasks";

    @Component({})
    export default class DayLog extends Vue {
        combineSameCodes = false;

        data() {
            return {}
        }

        get tasksGrouped() {
            let groups = store.getters.getTasksGrouped;
            let result = groups;
            if (this.combineSameCodes) {
                groups.map((group, group_id) => {
                    let tasks = Store_MergeSameCodes(group.get('tasks'));
                    result = result.setIn([group_id, 'tasks'], tasks);
                });
            }
            return result.toJS();
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

        .Code.combined {
            font-weight: bold;
        }
    }
</style>
