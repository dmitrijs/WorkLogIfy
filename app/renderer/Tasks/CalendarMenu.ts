import electron from "electron";

const {Menu, MenuItem} = electron;

export class SPECIAL_DAYS {
    public static HOLIDAY = 'holiday';
    public static WORKDAY = 'workday';
    public static SHORTDAY = 'shortday';
    public static VACATION = 'vacation';
    public static UNPAID = 'unpaid';
}

export default function createCalendarMenu(mainWindow, params) {
    // let dayCode = store.state.calendarHoveredDayCode;
    //
    // function update_special_day_status(dayCode, status) {
    //     let settings = store.state.settings;
    //     settings.special_days = settings.special_days || {};
    //     if (status) {
    //         settings.special_days[dayCode] = status;
    //     } else {
    //         delete settings.special_days[dayCode];
    //     }
    //     store.updateSettings(settings);
    //     callback();
    // }

    console.log('createCalendarMenu', params)
    const {dayCode} = params;

    function command(dayCode, dayType) {
        console.log(`command: '${dayCode}' '${dayType}'`)
        mainWindow.webContents.send('calendar-menu-command', {dayCode, dayType});
    }

    const menu = new Menu();
    menu.append(new MenuItem({
        enabled: false,
        label: dayCode,
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a holiday', click() {
            command(dayCode, SPECIAL_DAYS.HOLIDAY)
            // update_special_day_status(dayCode, SPECIAL_DAYS.HOLIDAY);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a short (7h) day', click() {
            command(dayCode, SPECIAL_DAYS.SHORTDAY)
            // update_special_day_status(dayCode, SPECIAL_DAYS.SHORTDAY);
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a vacation', click() {
            command(dayCode, SPECIAL_DAYS.VACATION)
            // update_special_day_status(dayCode, SPECIAL_DAYS.VACATION);
        },
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is unpaid', click() {
            command(dayCode, SPECIAL_DAYS.UNPAID)
            // update_special_day_status(dayCode, SPECIAL_DAYS.UNPAID);
        },
    }));
    menu.append(new MenuItem({
        type: 'separator',
    }));
    menu.append(new MenuItem({
        enabled: (!!dayCode),
        label: '... is a work day', click() {
            command(dayCode, SPECIAL_DAYS.WORKDAY)
            // update_special_day_status(dayCode, SPECIAL_DAYS.WORKDAY);
        },
    }));
    menu.append(new MenuItem({
        label: '... is not special', click() {
            command(dayCode, null)
            // update_special_day_status(dayCode, null);
        },
    }));

    return menu;
}
