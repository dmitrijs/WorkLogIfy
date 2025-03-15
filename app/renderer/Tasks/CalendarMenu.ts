const remote = window.remote;
const {Menu, MenuItem} = remote;

export class SPECIAL_DAYS {
    public static HOLIDAY = 'holiday';
    public static WORKDAY = 'workday';
    public static SHORTDAY = 'shortday';
    public static VACATION = 'vacation';
    public static UNPAID = 'unpaid';
}

export default function createCalendarMenu(store, callback) {
    let dayCode = store.state.calendarHoveredDayCode;

    function update_special_day_status(dayCode, status) {
        let settings = store.state.settings;
        settings.special_days = settings.special_days || {};
        if (status) {
            settings.special_days[dayCode] = status;
        } else {
            delete settings.special_days[dayCode];
        }
        store.updateSettings(settings);
        callback();
    }

    const menu = new Menu();
    menu.append(new MenuItem({
        enabled: false,
        label: dayCode,
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a holiday', click() {
            update_special_day_status(dayCode, SPECIAL_DAYS.HOLIDAY);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a short (7h) day', click() {
            update_special_day_status(dayCode, SPECIAL_DAYS.SHORTDAY);
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a vacation', click() {
            update_special_day_status(dayCode, SPECIAL_DAYS.VACATION);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is unpaid', click() {
            update_special_day_status(dayCode, SPECIAL_DAYS.UNPAID);
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a work day', click() {
            update_special_day_status(dayCode, SPECIAL_DAYS.WORKDAY);
        },
    }));
    menu.append(new MenuItem({
        label: '... is not special', click() {
            update_special_day_status(dayCode, null);
        },
    }));

    return menu;
}
