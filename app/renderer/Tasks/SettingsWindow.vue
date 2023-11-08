<template>
    <div class="SettingsWindow">
        <label>JIRA Host:</label> <input type="text" v-model="settings.jira_host" placeholder="example.atlassian.net"><br/>
        <label>JIRA Email:</label> <input type="text" v-model="settings.jira_username" placeholder="you@example.com"><br/>
        <label>JIRA API Token:</label> <input type="password" v-model="settings.jira_password" placeholder="***********"> <a target="_blank" href="https://id.atlassian.com/manage-profile/security/api-tokens">API tokens</a><br/>
        <br/>
        <label>Asana API Token:</label> <input type="password" v-model="settings.asana_token" placeholder="***********"><br/>
        <label>Asana Workspace (<a href="#" @click.prevent="asanaRefreshWorkspace()"><i class="icofont-refresh"></i></a>):</label>
        <select v-model="settings.asana_workspace_id" @change="settings.asana_workspace_name = asanaWorkspaces[settings.asana_workspace_id].name">
            <option :value="settings.asana_workspace_id">Current: {{ settings.asana_workspace_name }}</option>
            <template v-for="workspace of asanaWorkspaces">
                <option :value="workspace.gid">{{ workspace.name }}</option>
            </template>
        </select>
        <label>Asana Filter:</label> <input type="text" disabled value="not implemented"><br/>
        <br/>
        <label>Round to nearest:</label> <input type="number" step="10" v-model="settings.rounding_minutes"> minutes<br/>
        <label>Sort by:</label>
        <select v-model="settings.sorting_order">
            <option :value="undefined">Default (status, time spent, etc.)</option>
            <option value="first_session">First session start time</option>
            <option value="last_session_group_same_code">Last session start time, group tasks with same code</option>
        </select>
        <br/>
        <button type="button" class="btn btn-xs btn-primary" @click="store.updateSettings(settings)">save
        </button>
        <br/>
        <div v-if="store.state.is_debug">{{ settings }}</div>
    </div>
</template>

<script lang="ts">
    import _ from "lodash";
    import {Component, Vue} from "vue-facing-decorator";
    import store from "../Store/Store";

    @Component({})
    export default class SettingsWindow extends Vue {
        asanaWorkspaces = {} as Record<string, AsanaWorkspaceObj>;

        get settings() {
            return store.state.settings;
        }

        get store() {
            return store;
        }

        asanaRefreshWorkspace() {
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
                // body: JSON.stringify({}),
            }));
            this.asanaWorkspaces = _.keyBy(asanaWorkspacesCall.response.data, 'gid');
        }
    }
</script>

<style scoped lang="scss">
    .SettingsWindow {
        overflow-y: auto;
        max-height: 100%;
        padding: 6px;

        label {
            width: 140px;
        }

        select,
        input[type=text],
        input[type=password] {
            width: 280px;
        }

        input[type=number] {
            width: 60px;
        }

        select {
            height: 22px;
            margin-left: 4px;
        }
    }
</style>
