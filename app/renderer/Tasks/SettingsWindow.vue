<template>
    <div class="SettingsWindow">
        <label>JIRA Host:</label> <input type="text" v-model="settings.jira_host" placeholder="https://example.atlassian.net"><br/>
        <label>JIRA Username:</label> <input type="text" v-model="settings.jira_username" placeholder="you@example.com"><br/>
        <label>JIRA Password:</label> <input type="password" v-model="settings.jira_password" placeholder="***********"><br/>
        <!--<button @click="jiraValidate()" class="btn btn-xs btn-secondary">validate</button><br />-->
        <br/>
        <button type="button" class="btn btn-xs btn-primary" @click="store.commit.updateSettings(settings)">save
        </button>
        <br />
        <div v-if="store.state.is_debug">{{ settings }}</div>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";

    @Component({
        created() {
            store.commit.setFileTotals(window.ipc.sendSync('tasks.getFileTotals'));
        },
    })
    export default class SettingsWindow extends Vue {
        get settings() {
            return store.state.settings.toJS();
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
