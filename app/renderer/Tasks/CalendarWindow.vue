<template>
    <div class="CalendarWindow">
        <br/>
        <div>
            <div v-for="(week, week_key) of weeks" class="Week">
                <h4>{{ week_key }}</h4>
                <span v-for="(day) of week" class="Day">
                    <button @click="open(day.dayCode)">
                        <strong>{{ day }}</strong>
                    </button>&nbsp;
                </span>
            </div>
        </div>

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
    import {comparatorGt, timespanToText} from "../Utils/Utils";

    const moment = require("moment");

    @Component({})
    export default class CalendarWindow extends Vue {
        get weeks() {
            let weeks = {};
            let today = moment.utc();
            let endOfThisMonth = moment(today).endOf('month').endOf('day');
            let startOfMonthBeforePrevious = moment(today).subtract(2, 'months').startOf('month');

            let totals = store.getters.getFileTotals;

            let day = moment(startOfMonthBeforePrevious);
            do {
                // make sure it's NEXT_YEAR-01 on December 31
                let weekCode = moment(day).endOf('isoWeek').format('YYYY-WW');
                let week = weeks[weekCode] || {};
                let dayCode = day.format('YYYY-MM-DD');

                {
                    let dowIso = parseInt(day.format("E"));

                    let suffix = "";
                    if (dowIso === 1 || dowIso === 5) {
                        suffix = day.format("(MMM D)");
                    }
                    this.$set(week, dayCode, {
                        dayCode: dayCode,
                        title: day.format('DD'),
                        // suffix: suffix,
                        // isWeekend: (dowIso >= 6),
                        // counter: dowIso,
                        charged_seconds_text: timespanToText(totals[dayCode] ? totals[dayCode].time_charge_rounded_seconds : 0),
                    });
                }
                this.$set(weeks, weekCode, week);

                day.add(1, 'day');
            } while (day.isBefore(endOfThisMonth));

            return weeks;
        }

        get filesByWeeks() {
            let fileNames = store.getters.getAllFiles;

            let list = List();

            for (let obj of fileNames) {
                let fn = obj.key;
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

    .CalendarWindow {
        overflow-y: scroll;
        max-height: 100%;
    }
</style>
