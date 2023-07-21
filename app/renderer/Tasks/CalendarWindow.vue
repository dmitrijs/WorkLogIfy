<template>
    <div class="CalendarWindow">
        <br v-if="!weekKey"/>
        <div>
            <div v-for="(week, week_key) of weeks" class="Week" :data-week="week_key">
                <div v-for="(dayCode) of week.days" class="Day"
                     @click="open(dayCode)"
                     @mouseenter="store.commit.calendarHoveredDayCode(dayCode)"
                     @mouseleave="store.commit.calendarHoveredDayCode(null)"
                     :title="days[dayCode].dayCode"
                     :class="{
                         is_today: days[dayCode].isToday,
                         is_current_month: days[dayCode].isCurrentMonth,
                         is_opened: days[dayCode].isOpened,
                         is01: days[dayCode].isFirstDayOfTheMonth,
                         is_weekend: days[dayCode].isWeekend,
                         ['is_special_day_' + specialDays[dayCode]]: !!specialDays[dayCode],
                    }">
                    <span class="DayTitle">{{ days[dayCode].title }}</span>
                    <span class="TimeCharged">{{ days[dayCode].charged_seconds_text }}</span>
                </div>
                <span class="MonthTimeCharged" v-if="months[week_key] && months[week_key].month_charged_seconds">
                    <span class="_Week" v-if="week.week_charged">&Sigma; {{ week.week_charged_text }}</span><br/>
                    <span class="_Month">{{ months[week_key].month_title }}:
                        <span
                            :class="{ MonthOvertime: months[week_key].month_overtime_seconds > 0, MonthOvertimeWarning: months[week_key].month_overtime_seconds >= 7200 }"
                            :title="months[week_key].month_overtime_text">
                            {{ months[week_key].month_charged_seconds_text }}
                        </span>
                    </span>
                </span>
                <span class="WeekTimeCharged" v-if="!months[week_key] && week.week_charged">&Sigma; {{ week.week_charged_text }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-facing-decorator";
    import store from "../Store/Store";
    import Store_GetCalendarStatistics from "../Store/Store_GetCalendarStatistics";
    import createCalendarMenu from "./CalendarMenu";

    const remote = window.remote;

    @Component({})
    export default class CalendarWindow extends Vue {

        cache = null;

        @Prop({type: String}) weekKey;

        get store() {
            return store;
        }

        get weeks() {
            this.collect_data();

            if (this.weekKey) {
                if (this.cache.weeks[this.weekKey]) {
                    return {
                        weekKey: this.cache.weeks[this.weekKey],
                    }
                }
                return {}; // do not show anything if week was requested but not found
            }
            return this.cache.weeks;
        }

        get months() {
            this.collect_data();

            return this.cache.months;
        }

        get days() {
            this.collect_data();

            return this.cache.days;
        }

        get specialDays() {
            return store.state.settings['special_days'] || {};
        }

        collect_data() {
            if (this.cache) {
                return;
            }

            this.cache = Store_GetCalendarStatistics();
        }

        open(day) {
            store.commit.setDay(day);
            store.commit.returnToTasksScreen();
        }

        created() {
            store.commit.setFileTotals(window.ipc.sendSync('tasks.getFileTotals'));
        }

        mounted() {
            if (this.weekKey) {
                return;
            }
            window.addEventListener('contextmenu', this.calendarMenuShow, false);
        }

        beforeUnmount() {
            if (this.weekKey) {
                return;
            }
            window.removeEventListener('contextmenu', this.calendarMenuShow);
        }

        calendarMenuShow(e) {
            console.log('tasks context menu');
            e.preventDefault();
            createCalendarMenu(() => this.cache = null).popup({window: remote.getCurrentWindow()})
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

                .MonthOvertime {
                    color: #8a4444;
                }

                .MonthOvertimeWarning {
                    color: #b30e0d;
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
            padding: 1px 4px;
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

            &.is_special_day_vacation {
                color: #8b26b6 !important;
                background-color: #f9ecff;
            }

            &.is_special_day_holiday {
                color: green !important;
                background-color: #f2fff3;
            }

            &.is_special_day_shortday,
            &.is_special_day_workday {
                color: black !important;

                &.is_special_day_shortday {
                    color: green !important;
                }

                &.is_current_month {
                    border-color: #bdbdbd;
                }
            }

            &.is_special_day_unpaid {
                background-color: #efefef;
                text-decoration: line-through;
            }

            &:hover {
                background-color: #e6faff;
                border-color: #b6c8ca !important;
            }

            &.is_opened {
                border-color: black !important;
            }

            &:hover,
            &.is_opened {
                border-width: 2px;
                padding: 0 3px;

                .TimeCharged {
                    right: 1px;
                    bottom: -2px;
                }
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
