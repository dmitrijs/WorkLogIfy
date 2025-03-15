import React from 'react';
import App from "./App";
import { useStoreContext} from './Store/Store';
import TaskEdit from "./Tasks/TaskEdit";
// import ActiveAppsWindow from './Tasks/ActiveAppsWindow';
// import CalendarWindow from './Tasks/CalendarWindow';
// import SettingsWindow from './Tasks/SettingsWindow';
// import TaskEdit from './Tasks/TaskEdit';
import TasksWindow from './Tasks/TasksWindow';
// import TemplatesWindow from './Tasks/TemplatesWindow';
// import TodosWindow from './Tasks/TodosWindow';
// import timer from './Timer';
import MainMenu from './MainMenu';
import timer from "./Timer";
import StoreContentProvider from './Store/Store';

const AppBase = () => {
    return (
        <StoreContentProvider children={<App />}>
        </StoreContentProvider>
    );
};

export default AppBase;
