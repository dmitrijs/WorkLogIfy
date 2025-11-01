import React, { useState } from 'react';
import {useStoreContext} from "./Store/Store";

const MainMenu = () => {
    const store = useStoreContext();
    const [shownSubmenus, setShownSubmenus] = useState({ submenu: false });

    const handleMenuClick = (screen) => {
        store.setScreen(screen);
    };

    const toggleSubmenu = () => {
        setShownSubmenus((prev) => ({ ...prev, submenu: !prev.submenu }));
    };

    const quit = () => {
        window.ipc.send('quit.unconfirmed');
    };

    return (
        <div className="MainMenu">
            <ul>
                <li onClick={() => handleMenuClick('tasks')} className={store.state.screen === 'tasks' ? 'Selected' : ''}>
                    <span><i className="icofont-tasks"></i> Tasks</span>
                </li>
                <li onClick={() => handleMenuClick('active_apps')} className={store.state.screen === 'active_apps' ? 'Selected' : ''}>
                    <span><i className="icofont-clock-time"></i> Active Apps</span>
                </li>
                <li onClick={() => handleMenuClick('calendar')} className={store.state.screen === 'calendar' ? 'Selected' : ''}>
                    <span><i className="icofont-calendar"></i> Calendar</span>
                </li>
                <li onClick={() => handleMenuClick('settings')} className={store.state.screen === 'settings' ? 'Selected' : ''}>
                    <span><i className="icofont-settings-alt"></i> Settings</span>
                </li>
                <li className={'Hamburger relative ' + (store.state.screen === 'submenu' ? 'Selected' : '')}>
                    <span onClick={toggleSubmenu}><i className="icofont-navigation-menu"></i></span>
                    <ul className={`Submenu ${shownSubmenus.submenu ? 'Visible' : ''}`}>
                        <li>
                            <span onClick={() => { setShownSubmenus({ submenu: false }); store.toggleDarkMode(); }}>
                                <i className="icofont-listing-box"></i> <em>Dark/Light</em>
                            </span>
                        </li>
                        <li>
                            <span onClick={() => { setShownSubmenus({ submenu: false }); handleMenuClick('todo'); }}>
                                <i className="icofont-listing-box"></i> <em>To-do</em>
                            </span>
                        </li>
                        <li>
                            <span onClick={() => { setShownSubmenus({ submenu: false }); handleMenuClick('task.templates'); }}>
                                <i className="icofont-copy"></i> <em>Templates</em>
                            </span>
                        </li>
                        <li className="separator"></li>
                        <li>
                            <span onClick={() => { setShownSubmenus({ submenu: false }); quit(); }}>
                                <i className="icofont-exit"></i> <em>Quit</em> {store.state.taskTimeredId && <i className="icofont-warning" title="Task is active!"></i>}
                            </span>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
    );
};

export default MainMenu;
