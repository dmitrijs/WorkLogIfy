import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useStoreContext } from '../Store/Store';

const ActiveAppsWindow = () => {
    const store = useStoreContext();
    const [activeApps, setActiveApps] = useState([]);

    useEffect(() => {
        setActiveApps(store.state.activeApps.slice().reverse());
    }, [store.state.activeApps]);

    return (
        <div className="ActiveAppsWindow">
            <table>
                <thead>
                <tr>
                    <td>Time</td>
                    <td>Task?</td>
                    <td>App</td>
                </tr>
                </thead>
                <tbody>
                {activeApps.map((activeApp) => (
                    <tr key={activeApp.noticed_at} className={activeApp.seconds_idle > 60 ? 'Idle' : ''}>
                        <td className="TD-Time" title={`Idle: ${activeApp.seconds_idle}s`}>
                            {moment(activeApp.noticed_at).format('YYYY-MM-DD HH:mm')}
                            {moment().diff(moment(activeApp.noticed_at), 'hour') <= 4 && (
                                <span>({moment().diff(moment(activeApp.noticed_at), 'minute')}m ago)</span>
                            )}
                        </td>
                        <td>{activeApp.timered_task ? (store.state.tasks[activeApp.timered_task]?.code || 'Y') : '-'}</td>
                        <td className="TD-Description">
                            <div title={activeApp.description}>{activeApp.description}</div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveAppsWindow;
