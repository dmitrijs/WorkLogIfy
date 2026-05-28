import { timespanToText } from "../Utils/Utils";
import { Moment } from "moment";
import { SPECIAL_DAYS } from "../Tasks/CalendarMenu";
import moment from "moment";

export default function Store_GetCalendarStatistics(): CalendarStatistics {
    const days = {} as { [key: string]: CalendarDayStatistics };

    {
        const today = moment.utc();
        const endOfThisMonth = moment(today).endOf("month").add(1, "month").endOf("day");
        const startOfMonthBeforePrevious: Moment = moment(today)
            .subtract(2, "months")
            .startOf("month");
        const startOfWeekOfStartOfMonthBeforePrevious = startOfMonthBeforePrevious
            .clone()
            .startOf("isoWeek");

        const totals = (window as any).storeGlobal.getFileTotals();

        const todayCode = moment().format("YYYY-MM-DD");
        const currentMonthCode = moment().format("YYYY-MM");
        const day = moment(endOfThisMonth).endOf("isoWeek");
        do {
            const dayCode = day.format("YYYY-MM-DD");
            const weekCode = moment(day).endOf("isoWeek").format("YYYY-WW"); // make sure it's NEXT_YEAR-01 on December 31
            const monthLastWeekCode = moment(day).endOf("month").endOf("isoWeek").format("YYYY-WW");

            const dow = day.isoWeekday();

            const currentDay = {} as CalendarDayStatistics;
            currentDay.dayCode = dayCode;
            currentDay.weekCode = weekCode;
            currentDay.monthLastWeekCode = monthLastWeekCode;
            currentDay.monthName = day.format("MMM");
            currentDay.isFirstDayOfTheMonth = day.format("DD") === "01";
            currentDay.title = currentDay.isFirstDayOfTheMonth
                ? day.format("MMM DD")
                : day.format("DD");
            currentDay.isOpened = (window as any).storeGlobal.state.day_key === dayCode;
            currentDay.isToday = todayCode === dayCode;
            currentDay.isWeekend = dow >= 6;
            currentDay.isCurrentMonth = currentMonthCode === day.format("YYYY-MM");
            currentDay.paid = true;

            if (day.isAfter(startOfMonthBeforePrevious)) {
                const charged_seconds = totals[dayCode]
                    ? totals[dayCode].time_charge_rounded_seconds
                    : 0;
                currentDay.charged_seconds = charged_seconds;
                currentDay.charged_seconds_text = timespanToText(charged_seconds, "");
            } else {
                // show empty cells if month is outside the range
                currentDay.title = "";
            }

            currentDay.expectedHours = currentDay.isWeekend ? 0 : 8;

            if (
                (window as any).storeGlobal.state.settings["special_days"] &&
                (window as any).storeGlobal.state.settings["special_days"][dayCode]
            ) {
                switch ((window as any).storeGlobal.state.settings["special_days"][dayCode]) {
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

            day.subtract(1, "day");
        } while (day.isAfter(startOfWeekOfStartOfMonthBeforePrevious));
    }

    const weeks = {} as { [key: string]: CalendarWeekStatistics };

    {
        Object.keys(days).forEach((dayCode) => {
            const day = days[dayCode] as CalendarDayStatistics;
            if (!weeks[day.weekCode]) {
                weeks[day.weekCode] = {
                    days: [],
                    week_charged: 0,
                    week_charged_text: "",
                } as CalendarWeekStatistics;
            }
            weeks[day.weekCode].days.push(dayCode);
        });

        for (const weekCode of Object.keys(weeks)) {
            // reorder days
            weeks[weekCode].days = weeks[weekCode].days.reverse();
            // sum up seconds
            weeks[weekCode].week_charged = weeks[weekCode].days.reduceRight((sum, dayCode) => {
                return sum + (days[dayCode].paid ? days[dayCode].charged_seconds : 0);
            }, 0);
            weeks[weekCode].week_charged_text = timespanToText(weeks[weekCode].week_charged, "");
        }
    }

    const months = {} as { [key: string]: CalendarMonthStatistics };

    {
        // sum up seconds
        Object.keys(days).forEach((dayCode) => {
            const day = days[dayCode] as CalendarDayStatistics;

            const currentMonth = (months[day.monthLastWeekCode] || {}) as CalendarMonthStatistics;

            const month_charged_seconds =
                (currentMonth.month_charged_seconds || 0) +
                (days[dayCode].paid ? days[dayCode].charged_seconds : 0);
            currentMonth.month_charged_seconds = month_charged_seconds;
            currentMonth.month_charged_seconds_text = timespanToText(month_charged_seconds, "");
            currentMonth.month_title = currentMonth.month_title || day.monthName;

            currentMonth.month_official_seconds =
                (currentMonth.month_official_seconds || 0) + days[dayCode].expectedHours * 3600;
            months[day.monthLastWeekCode] = currentMonth;
        });

        // calculate overtime
        for (const month_code of Object.keys(months)) {
            const month = months[month_code];

            const month_seconds_diff =
                months[month_code].month_charged_seconds -
                months[month_code].month_official_seconds;
            if (month_seconds_diff != 0) {
                month.month_overtime_seconds = Math.abs(month_seconds_diff);
                month.month_overtime_text =
                    timespanToText(Math.abs(month_seconds_diff)) +
                    " " +
                    (month_seconds_diff > 0 ? "overtime" : "missing");
            }

            months[month_code] = month;
        }
    }

    return { days, weeks, months };
}
