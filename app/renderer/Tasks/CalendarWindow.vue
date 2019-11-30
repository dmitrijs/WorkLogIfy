<template>
    <div class="CalendarWindow">
        <br/>
        <template v-for="(days) of filesByWeeks">
            <template v-for="(day) of days">
                <button @click="open(day.fn)" :class="{ Weekend: day.isWeekend }">
                    <strong>{{ day.title }}</strong> {{day.suffix}}
                </button>&nbsp;
            </template>
            <hr/>
        </template>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";
    import {List} from "immutable";
    import {comparatorGt} from "../Utils/Utils";

    const moment = require("moment");

    @Component({})
    export default class CalendarWindow extends Vue {
        get filesByWeeks() {
            let fileNames = store.getters.getAllFiles;

            let list = List();

            for (let fn of fileNames) {
                let day = moment(fn, 'YYYY-MM-DD');
                let dowIso = parseInt(day.format("E"));

                let suffix = "";
                if (dowIso === 1 || dowIso === 5) {
                    suffix = day.format("(MMM D)");
                }
                list = list.push({
                    fn: fn,
                    week: parseInt(day.format("W")),
                    title: day.format('ddd'),
                    suffix: suffix,
                    isWeekend: (dowIso >= 6),
                    counter: dowIso,
                });
            }

            let map = list.groupBy((x) => x['week']);
            map = map.map((list) => {
                return list.sortBy((val) => val['counter'], comparatorGt);
            });
            map = map.toOrderedMap().sortBy((val, key) => -key);
            return map.toList();
        }

        open(day) {
            store.commit.setDay(day);
            store.commit.returnToTasksScreen();
        }
    }
</script>

<style scoped lang="scss">
    .Weekend {
        opacity: 0.3;
    }
</style>
