<template>
    <div class="CalendarWindow">
        <br/>
        <div>
            <div v-for="(week, week_key) of weeks" class="Week" :data-week="week_key">
                <div v-for="(dayCode) of week.days" class="Day"
                     @click="open(dayCode)"
                     :title="days[dayCode].dayCode"
                     :class="{ is_today: days[dayCode].isToday, is_current_month: days[dayCode].isCurrentMonth, is_opened: days[dayCode].isOpened, is01: days[dayCode].isFirstDayOfTheMonth, is_weekend: days[dayCode].isWeekend }">
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

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";
    import Store_GetCalendarStatistics from "../Store/Store_GetCalendarStatistics";

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

        get days() {
            this.collect_data();

            return this.data.days;
        }

        collect_data() {
            if (this.data) {
                return;
            }

            this.data = Store_GetCalendarStatistics();
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
