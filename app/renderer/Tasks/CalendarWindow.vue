<template>
    <div class="CalendarWindow">
        <br/>
        <div>
            <div v-for="(week, week_key) of weeks" class="Week" :data-week="week_key">
                <div v-for="(day) of week.days" class="Day"
                     @click="open(day.dayCode)"
                     :title="day.dayCode"
                     :class="{ is_today: day.isToday, is_current_month: day.isCurrentMonth, is_opened: day.isOpened, is01: day.isFirstDayOfTheMonth, is_weekend: day.isWeekend }">
                    <span class="DayTitle">{{ day.title }}/{{day.isLastDay}}</span>
                    <span class="TimeCharged">{{ day.charged_seconds_text }}</span>
                </div>
                <span class="MonthTimeCharged" v-if="months[week_key] && months[week_key].month_charged_seconds">
                    <span class="_Week" v-if="week.week_charged">&Sigma; {{ week.week_charged_text }}</span><br />
                    <span class="_Month">{{ months[week_key].month_title }}: {{ months[week_key].month_charged_seconds_text }}</span>
                </span>
                <span class="WeekTimeCharged" v-if="!months[week_key] && week.week_charged">&Sigma; {{ week.week_charged_text }}</span>
            </div>
        </div>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";
    import {timespanToText} from "../Utils/Utils";

    const moment = require("moment");

    @Component({
        created() {
            store.commit.setFileTotals(window.ipc.sendSync('tasks.getFileTotals'));
        },
    })
    export default class CalendarWindow extends Vue {

        data = null;

        get weeks() {
            this.collect_data();

            return this.data.weeks;
        }

        get months() {
            this.collect_data();

            return this.data.months;
        }

        collect_data() {
            if (this.data) {
                return;
            }

            let weeks = {};
            let months = {};
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

                let monthCode = moment(day).endOf('month').endOf('isoWeek').format('YYYY-WW');
                let month = months[monthCode] || {};

                {
                    let charged_seconds = (totals[dayCode] ? totals[dayCode].time_charge_rounded_seconds : 0);
                    let dow = day.format('E');

                    this.$set(week, dayCode, {
                        dayCode: dayCode,
                        title: (day.format('DD') === '01' ? day.format('MMM DD') : day.format('DD')),
                        isOpened: (store.state.day_key === dayCode),
                        isFirstDayOfTheMonth: (day.format('DD') === '01'),
                        isToday: (todayCode === dayCode),
                        isWeekend: (dow >= 6),
                        isCurrentMonth: (currentMonthCode === day.format('YYYY-MM')),
                        charged_seconds: charged_seconds,
                        charged_seconds_text: timespanToText(charged_seconds, ''),
                    });

                    let month_charged_seconds = (month.month_charged_seconds || 0) + charged_seconds;
                    this.$set(month, 'month_charged_seconds', month_charged_seconds);
                    this.$set(month, 'month_charged_seconds_text', timespanToText(month_charged_seconds, ''));
                    this.$set(month, 'month_title', month.month_title || moment(day).format('MMM'));
                    this.$set(months, monthCode, month);
                }
                this.$set(weeks, weekCode, week);

                day.subtract(1, 'day');
            } while (day.isAfter(startOfMonthBeforePrevious));

            for (let week_code of Object.keys(weeks)) {
                let sumCharged = 0;
                let daysSorted = {};
                for (let day_code of Object.keys(weeks[week_code]).reverse()) {
                    let day = weeks[week_code][day_code];
                    sumCharged += day.charged_seconds;
                    daysSorted[day_code] = day;
                }
                this.$set(weeks, week_code, {
                    days: daysSorted,
                    week_charged: sumCharged,
                    week_charged_text: timespanToText(sumCharged, ''),
                });
            }

            this.data = {weeks, months};
        }

        open(day) {
            store.commit.setDay(day);
            store.commit.returnToTasksScreen();
        }
    }
</script>

<style scoped lang="scss">
    .CalendarWindow {
        overflow-y: auto;
        max-height: 100%;

        .Week {
            display: flex;

            .MonthTimeCharged {
                line-height: 13px;
                padding-left: 5px;
                color: grey;
                padding-top: 3px;

                ._Month {
                    color: #bebebe;
                }
            }
            .WeekTimeCharged {
                line-height: 29px;
                padding-left: 5px;
                color: grey;
            }
        }

        .Day {
            border: 1px solid #f5f5f5;
            width: 54px;
            height: 30px;
            padding: 0 3px;
            position: relative;
            cursor: pointer;

            color: #a2a2a2;

            &.is_weekend {
                color: #d0d0d0;
            }

            &.is_current_month {
                color: black;
                border: 1px solid #bdbdbd;

                &.is_weekend {
                    color: #9c9c9c;
                    border-color: #e4e4e4;
                }
            }

            &.is_today {
                border-color: #00c4ff;
            }
            &.is01 {
                border-left-color: #8e8e8e !important;
                border-bottom-color: #8e8e8e !important;
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
