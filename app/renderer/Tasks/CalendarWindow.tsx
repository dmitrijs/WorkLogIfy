import React, {useEffect, useState} from 'react';
import {useStoreContext} from '../Store/Store';
import Store_GetCalendarStatistics from '../Store/Store_GetCalendarStatistics';
import createCalendarMenu from './CalendarMenu';

const {remote} = window;

const CalendarWindow = ({weekKey}) => {
    const store = useStoreContext();
    const [cache, setCache] = useState(null);

    const collectData = () => {
        if (cache) return;
        setCache(Store_GetCalendarStatistics());
    };

    const open = (day) => {
        store.setDay(day);
        store.returnToTasksScreen();
    };

    const calendarMenuShow = (e) => {
        e.preventDefault();
        createCalendarMenu(store, () => setCache(null)).popup({window: remote.getCurrentWindow()});
    };

    useEffect(() => {
        store.setFileTotals(window.ipc.sendSync('tasks.getFileTotals'));
        if (!weekKey) {
            window.addEventListener('contextmenu', calendarMenuShow, false);
        }
        return () => {
            if (!weekKey) {
                window.removeEventListener('contextmenu', calendarMenuShow);
            }
        };
    }, [weekKey]);

    collectData();

    const weeks = weekKey ? (cache?.weeks[weekKey] ? {[weekKey]: cache.weeks[weekKey]} : {}) : cache?.weeks;
    const months = cache?.months;
    const days = cache?.days;
    const specialDays = store.state.settings['special_days'] || {};

    if (!weeks) {
        return <></>
    }

    return (
        <div className="CalendarWindow">
            <br/>
            <div>
                {Object.entries(weeks).map(([week_key, week]: any) => (
                    <div key={week_key} className="Week" data-week={week_key}>
                        {weekKey && (
                            <a href="#" className="PrevNextButton" onClick={() => open(store.state.day_key_prev_week)}>
                                <i className="icofont-rounded-left"></i>
                            </a>
                        )}
                        {week.days.map((dayCode) => (
                            <div
                                key={dayCode}
                                className={`Day ${
                                    days[dayCode].isToday ? 'is_today' : ''
                                } ${
                                    days[dayCode].isCurrentMonth ? 'is_current_month' : ''
                                } ${
                                    days[dayCode].isOpened ? 'is_opened' : ''
                                } ${
                                    days[dayCode].isFirstDayOfTheMonth ? 'is01' : ''
                                } ${
                                    days[dayCode].isWeekend ? 'is_weekend' : ''
                                } ${
                                    specialDays[dayCode] ? `is_special_day_${specialDays[dayCode]}` : ''
                                }`}
                                onClick={() => open(dayCode)}
                                onMouseEnter={() => store.calendarHoveredDayCode(dayCode)}
                                onMouseLeave={() => store.calendarHoveredDayCode(null)}
                                title={days[dayCode].dayCode}
                            >
                                <span className="DayTitle">{days[dayCode].title}</span>
                                <span className="TimeCharged">{days[dayCode].charged_seconds_text}</span>
                            </div>
                        ))}
                        {weekKey && (
                            <a href="#" className="PrevNextButton" onClick={() => open(store.state.day_key_next_week)}>
                                <i className="icofont-rounded-right"></i>
                            </a>
                        )}
                        {months[week_key] && months[week_key].month_charged_seconds && (
                            <span className="MonthTimeCharged">
                                <span className="_Week">{week.week_charged && `Σ ${week.week_charged_text}`}</span>
                                <br/>
                                <span className="_Month">
                                    {months[week_key].month_title}:
                                    <span
                                        className={`${
                                            months[week_key].month_overtime_seconds > 0 ? 'MonthOvertime' : ''
                                        } ${
                                            months[week_key].month_overtime_seconds >= 7200 ? 'MonthOvertimeWarning' : ''
                                        }`}
                                        title={months[week_key].month_overtime_text}
                                    >
                                        {months[week_key].month_charged_seconds_text}
                                    </span>
                                </span>
                            </span>
                        )}
                        {!months[week_key] && week.week_charged && (
                            <span className="WeekTimeCharged">Σ {week.week_charged_text}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarWindow;
