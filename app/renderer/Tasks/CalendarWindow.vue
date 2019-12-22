<template>
    <div class="CalendarWindow">
        <br/>
        <div>
            <div v-for="(week, week_key) of weeks" class="Week" :data-week="week_key">
                <div v-for="(day) of week.days" class="Day"
                     @click="open(day.dayCode)"
                     :class="{ is_today: day.isToday, is_current_month: day.isCurrentMonth, is_opened: day.isOpened }">
                    <span class="DayTitle">{{ day.title }}</span>
                    <span class="TimeCharged">{{ day.charged_seconds_text }}</span>
                </div>
                <span class="WeekTimeCharged" v-if="week.week_charged">&Sigma; {{ week.week_charged_text }}</span>
            </div>
        </div>
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

            let todayCode = moment().format('YYYY-MM-DD');
            let currentMonthCode = moment().format('YYYY-MM');
            let day = moment(endOfThisMonth).endOf('isoWeek');
            do {
                // make sure it's NEXT_YEAR-01 on December 31
                let weekCode = moment(day).endOf('isoWeek').format('YYYY-WW');
                let week = weeks[weekCode] || {};
                let dayCode = day.format('YYYY-MM-DD');

                {
                    let charged_seconds = (totals[dayCode] ? totals[dayCode].time_charge_rounded_seconds : 0);

                    this.$set(week, dayCode, {
                        dayCode: dayCode,
                        title: day.format('MMM DD'),
                        isOpened: (store.state.day_key === dayCode),
                        isToday: (todayCode === dayCode),
                        isCurrentMonth: (currentMonthCode === day.format('YYYY-MM')),
                        charged_seconds: charged_seconds,
                        charged_seconds_text: timespanToText(charged_seconds, ''),
                    });
                }
                this.$set(weeks, weekCode, week);

                day.subtract(1, 'day');
            } while (day.isAfter(startOfMonthBeforePrevious));

            for (let week_code of Object.keys(weeks)) {
                let sumCharged = 0;
                for (let day of Object.values(weeks[week_code])) {
                    console.log(day);
                    sumCharged += day.charged_seconds;
                }
                this.$set(weeks, week_code, {
                    days: weeks[week_code],
                    week_charged: sumCharged,
                    week_charged_text: timespanToText(sumCharged, ''),
                });
            }

            return weeks;
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

        .Week {
            display: flex;

            .WeekTimeCharged {
                line-height: 29px;
                padding-left: 5px;
                color: grey;
            }
        }

        .Day {
            border: 1px solid #d8d8d8;
            width: 54px;
            height: 30px;
            padding: 0 3px;
            position: relative;
            cursor: pointer;

            color: #a2a2a2;

            &.is_current_month {
                color: black;
            }

            &.is_today {
                border-color: #00c4ff;
            }

            &.is_opened,
            &:hover {
                background-color: #e6faff;
            }

            .DayTitle {

            }

            .TimeCharged {
                position: absolute;
                right: 2px;
                bottom: -1px;
                color: grey;
                font-size: smaller;
            }
        }
    }
</style>
