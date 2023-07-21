<template>
    <div class="SettingsWindow">
        <label>JIRA Host:</label> <input type="text" v-model="settings.jira_host" placeholder="example.atlassian.net"><br/>
        <label>JIRA Email:</label> <input type="text" v-model="settings.jira_username" placeholder="you@example.com"><br/>
        <label>JIRA API Token:</label> <input type="password" v-model="settings.jira_password" placeholder="***********"> <a target="_blank" href="https://id.atlassian.com/manage-profile/security/api-tokens">API tokens</a><br/>
        <br/>
        <button type="button" class="btn btn-xs btn-primary" @click="store.commit.updateSettings(settings)">save
        </button>
        <br />
        <div v-if="store.state.is_debug">{{ settings }}</div>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-facing-decorator";
    import store from "../Store/Store";

    @Component({})
    export default class SettingsWindow extends Vue {
        get settings() {
            return store.state.settings;
        }

        get store() {
            return store;
        }
    }
</script>

<style scoped lang="scss">
    .SettingsWindow {
        overflow-y: auto;
        max-height: 100%;
        padding: 6px;

        label {
            width: 100px;
        }
        input[type=text],
        input[type=password] {
            width: 300px;
        }
    }
</style>
