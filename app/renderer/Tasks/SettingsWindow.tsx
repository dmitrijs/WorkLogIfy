import React, { useState } from 'react';
import _ from 'lodash';
import { useStoreContext } from '../Store/Store';

const SettingsWindow = () => {
    const store = useStoreContext();
    const [asanaWorkspaces, setAsanaWorkspaces] = useState({});

    const asanaRefreshWorkspace = () => {
        const asanaWorkspacesCall = window.ipc.sendSync('jira.request', _.cloneDeep({
            url: 'https://app.asana.com/api/1.0/workspaces',
            headers: {
                Authorization: `Bearer ${store.state.settings.asana_token}`,
                Accept: 'application/json',
                "Content-Type": "application/json",
            },
            method: 'GET',
            redirect: "follow",
            referrerPolicy: "no-referrer",
        }));
        setAsanaWorkspaces(_.keyBy(asanaWorkspacesCall.response.data, 'gid'));
    };

    const asanaSearchTasks = () => {
        store.loadAsanaTasks(true);
        const tasksAsStrings = _.map(store.state.asanaTasks, (task) => {
            return `${task.gid}: ${task.name} (${task.assignee_section?.name})`;
        });
        alert(tasksAsStrings.join('\n'));
    };

    return (
        <div className="SettingsWindow">
            <label>JIRA Host:</label> <input type="text" value={store.state.settings.jira_host} onChange={(e) => store.state.settings.jira_host = e.target.value} placeholder="example.atlassian.net" /><br />
            <label>JIRA Email:</label> <input type="text" value={store.state.settings.jira_username} onChange={(e) => store.state.settings.jira_username = e.target.value} placeholder="you@example.com" /><br />
            <label>JIRA API Token:</label> <input type="password" value={store.state.settings.jira_password} onChange={(e) => store.state.settings.jira_password = e.target.value} placeholder="***********" /> <a target="_blank" rel="noreferrer" href="https://id.atlassian.com/manage-profile/security/api-tokens">API tokens</a><br />
            <br />
            <label>Asana API Token:</label> <input type="password" value={store.state.settings.asana_token} onChange={(e) => store.state.settings.asana_token = e.target.value} placeholder="***********" /><br />
            <label>Asana Workspace (<a href="#" onClick={(e) => { e.preventDefault(); asanaRefreshWorkspace(); }}><i className="icofont-refresh"></i></a>):</label>
            <select value={store.state.settings.asana_workspace_id} onChange={(e) => { store.state.settings.asana_workspace_id = e.target.value; store.state.settings.asana_workspace_name = asanaWorkspaces[e.target.value].name; }}>
                <option value={store.state.settings.asana_workspace_id}>Current: {store.state.settings.asana_workspace_name}</option>
                {Object.values(asanaWorkspaces).map((workspace:any) => (
                    <option key={workspace.gid} value={workspace.gid}>{workspace.name}</option>
                ))}
            </select>
            <label>Asana Filter (<a href="https://developers.asana.com/reference/searchtasksforworkspace" target="_blank" rel="noreferrer">docs</a>):</label>
            <input type="text" placeholder="&is_blocked=false&key=value" value={store.state.settings.asana_extra_filter} onChange={(e) => store.state.settings.asana_extra_filter = e.target.value} /> <a href="#" onClick={(e) => { e.preventDefault(); asanaSearchTasks(); }}>load</a><br />
            <br />

            <label>Integrations:</label>
            <span className="label--checkbox label--checkbox--with-text" onClick={() => store.state.settings.wake_up_connected_devices = !store.state.settings.wake_up_connected_devices}>
                <input type="checkbox" checked={store.state.settings.wake_up_connected_devices} /><span></span> Wake up connected devices (<em title="Android devices will be lock/unlocked automatically. Unlock code should be set to 0000.">info</em>)
            </span>
            <br />
            <br />

            <label>Round to nearest:</label> <input type="number" step="10" value={store.state.settings.rounding_minutes} onChange={(e) => store.state.settings.rounding_minutes = e.target.value} /> minutes<br />
            <label>Working day:</label> <input type="number" step="10" value={store.state.settings.working_day_minutes} onChange={(e) => store.state.settings.working_day_minutes = e.target.value} /> minutes<br />
            <label>Sort by:</label>
            <select value={store.state.settings.sorting_order} onChange={(e) => store.state.settings.sorting_order = e.target.value}>
                <option value={undefined}>Default (status, time spent, etc.)</option>
                <option value="first_session">First session start time</option>
                <option value="last_session_group_same_code">Last session start time, group tasks with same code</option>
            </select>
            <br />
            <button type="button" className="btn btn-xs btn-primary" onClick={() => store.updateSettings(store.state.settings)}>save</button>
            <br />
            {store.state.is_debug && <div>{JSON.stringify(store.state.settings)}</div>}
        </div>
    );
};

export default SettingsWindow;
