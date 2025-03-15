export interface IpcChannelMap {
    // main
    'timer-state': ['stopped' | 'active'];
    'asynchronous-message': [string];
    'synchronous-message': [string];
    'show.error': [{
        title: string,
        content: string,
    }];
    'flash.frame': [void];
    'jira.request': [object & { url: string } & RequestInit, { response: any }];
    'window.open': [void];

    'debug.state': [void, boolean];
    'tasks.save': [{
        day_key: string,
        arg1: object,
        arg2: object,
        arg3?: object,
    }];
    'activeApps.save': [{
        day_key: string,
        activeApps: object,
    }];
    'tasks.templates.save': [object];

    'tasks.load': [string, WorkDayObj];
    'settings.load': [void, SettingsObj];
    'tasks.getFileTotals': [void, object];
    'tasks.getTaskTemplates': [void, object];
    'quit.confirmed': [void];
    'quit.unconfirmed': [void];
    'tasks.showMenu': [{ task: TaskObj, allowCut: boolean, allowPaste: boolean }];
    'calendar.showMenu': [{ dayCode: string }];

    // renderer
    'change.screen': [string];
    'debug.toggle': [boolean];
    'migration': [string];
    'user-is-idle': [number];
    'user-active-app': [{ secondsIdle: number, appDescription: string }];
    'timer-stop': [void];
    'confirm-app-quit': [void];
    'tasks-menu-command': ['New Task' | 'Extract Task'];
    'tasks-menu-closed': [void];
    'calendar-menu-command': [{dayCode, dayType}];
    'set.progress': [{ progress?: number, indeterminate?: boolean }];

    'integrations.lock': [void];
    'integrations.wakeup': [void];
}
