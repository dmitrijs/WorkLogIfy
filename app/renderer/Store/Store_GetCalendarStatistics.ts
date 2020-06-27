import store from "./Store";
import {timespanToText} from "../Utils/Utils";
import {Moment} from "moment";
import {SPECIAL_DAYS} from "../Tasks/CalendarMenu";

const moment = require("moment");

export default function Store_GetCalendarStatistics(): CalendarStatistics {
    let days = {} as { [key: string]: CalendarDayStatistics };

    {
        let today = moment.utc();
        let endOfThisMonth = moment(today).endOf('month').endOf('day');
        let startOfMonthBeforePrevious: Moment = moment(today).subtract(2, 'months').startOf('month');
        let startOfWeekOfStartOfMonthBeforePrevious = startOfMonthBeforePrevious.clone().startOf('isoWeek');

        let totals = store.getters.getFileTotals;

        let todayCode = moment().format('YYYY-MM-DD');
        let currentMonthCode = moment().format('YYYY-MM');
        let day = moment(endOfThisMonth).endOf('isoWeek');
        do {
            let dayCode = day.format('YYYY-MM-DD');
            let weekCode = moment(day).endOf('isoWeek').format('YYYY-WW'); // make sure it's NEXT_YEAR-01 on December 31
            let monthLastWeekCode = moment(day).endOf('month').endOf('isoWeek').format('YYYY-WW');

            let dow = day.format('E');

            let currentDay = {} as CalendarDayStatistics;
            currentDay.dayCode = dayCode;
            currentDay.weekCode = weekCode;
            currentDay.monthLastWeekCode = monthLastWeekCode;
            currentDay.monthName = day.format('MMM');
            currentDay.isFirstDayOfTheMonth = (day.format('DD') === '01');
            currentDay.title = (currentDay.isFirstDayOfTheMonth ? day.format('MMM DD') : day.format('DD'));
            currentDay.isOpened = (store.state.day_key === dayCode);
            currentDay.isToday = (todayCode === dayCode);
            currentDay.isWeekend = (dow >= 6);
            currentDay.isCurrentMonth = (currentMonthCode === day.format('YYYY-MM'));
            currentDay.paid = true;

            if (day.isAfter(startOfMonthBeforePrevious)) {
                let charged_seconds = (totals[dayCode] ? totals[dayCode].time_charge_rounded_seconds : 0);
                currentDay.charged_seconds = charged_seconds;
                currentDay.charged_seconds_text = timespanToText(charged_seconds, '');
            } else {
                // show empty cells if month is outside the range
                currentDay.title = '';
            }

            currentDay.expectedHours = (currentDay.isWeekend ? 0 : 8);

            if (store.state.settings['special_days'] && store.state.settings['special_days'][dayCode]) {
                switch (store.state.settings['special_days'][dayCode]) {
                    case SPECIAL_DAYS.WORKDAY:
                        currentDay.expectedHours = 8;
                        break;

                    case SPECIAL_DAYS.SHORTDAY:
                        currentDay.expectedHours = 7;
                        break;

                    case SPECIAL_DAYS.VACATION:
                    case SPECIAL_DAYS.HOLIDAY:
                        currentDay.expectedHours = 0;
                        break;

                    case SPECIAL_DAYS.UNPAID:
                        currentDay.expectedHours = 0;
                        currentDay.paid = false;
                        break;
                }
            }
            if (dayCode > todayCode) {
                currentDay.expectedHours = 0;
            }

            days[dayCode] = currentDay;

            day.subtract(1, 'day');
        } while (day.isAfter(startOfWeekOfStartOfMonthBeforePrevious));
    }

    let weeks = {} as { [key: string]: CalendarWeekStatistics };

    {
        Object.keys(days).forEach((dayCode) => {
            let day = days[dayCode] as CalendarDayStatistics;
            if (!weeks[day.weekCode]) {
                weeks[day.weekCode] = {
                    days: [],
                } as CalendarWeekStatistics;
            }
            weeks[day.weekCode].days.push(dayCode);
        });

        for (let weekCode of Object.keys(weeks)) {
            // reorder days
            weeks[weekCode].days = weeks[weekCode].days.reverse();
            // sum up seconds
            weeks[weekCode].week_charged = weeks[weekCode].days.reduceRight((sum, dayCode) => {
                return sum + (days[dayCode].paid ? days[dayCode].charged_seconds : 0);
            }, 0);
            weeks[weekCode].week_charged_text = timespanToText(weeks[weekCode].week_charged, '');
        }
    }

    let months = {} as { [key: string]: CalendarMonthStatistics };

    {
        // sum up seconds
        Object.keys(days).forEach((dayCode) => {
            let day = days[dayCode] as CalendarDayStatistics;

            let currentMonth = (months[day.monthLastWeekCode] || {}) as CalendarMonthStatistics;

            let month_charged_seconds = (currentMonth.month_charged_seconds || 0) + (days[dayCode].paid ? days[dayCode].charged_seconds : 0);
            currentMonth.month_charged_seconds = month_charged_seconds;
            currentMonth.month_charged_seconds_text = timespanToText(month_charged_seconds, '');
            currentMonth.month_title = currentMonth.month_title || day.monthName;

            currentMonth.month_official_seconds = (currentMonth.month_official_seconds || 0) + (days[dayCode].expectedHours * 3600);
            months[day.monthLastWeekCode] = currentMonth;
        });

        // calculate overtime
        for (let month_code of Object.keys(months)) {
            let month = months[month_code];

            let month_seconds_diff = months[month_code].month_charged_seconds - months[month_code].month_official_seconds;
            if (month_seconds_diff != 0) {
                month.month_overtime_seconds = Math.abs(month_seconds_diff);
                month.month_overtime_text =
                    timespanToText(Math.abs(month_seconds_diff)) +
                    ' ' +
                    (month_seconds_diff > 0 ? 'overtime' : 'missing');
            }

            months[month_code] = month;
        }
    }

    return {days, weeks, months};
}
