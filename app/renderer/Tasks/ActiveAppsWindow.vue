<template>
    <div class="ActiveAppsWindow">
        <MainMenu></MainMenu>
        <table>
            <thead>
            <tr>
                <td>Time</td>
                <td>Task?</td>
                <td>App</td>
            </tr>
            </thead>
            <tbody>
            <template v-for="activeApp of activeApps">
                <tr
                        :class="{ Idle: activeApp.seconds_idle > 60}"
                >
                    <td class="TD-Time" :title="'Idle: ' + activeApp.seconds_idle + 's'">
                        {{ moment(activeApp.noticed_at).format('YYYY-MM-DD HH:mm') }}
                        <span v-if="moment().diff(moment(activeApp.noticed_at), 'hour') <= 4">({{ moment().diff(moment(activeApp.noticed_at), 'minute') }}m ago)</span>
                    </td>
                    <td>{{ activeApp.timered_task ? (store.state.tasks[activeApp.timered_task]?.code || 'Y') : '-' }}</td>
                    <td class="TD-Description">
                        <div :title="activeApp.description">{{ activeApp.description }}</div>
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts" setup>
    import moment from "moment";
    import {onMounted, ref} from "vue";
    import store from "../Store/Store";
    import MainMenu from "../MainMenu.vue";

    const activeApps = ref<ActiveAppObj[]>([]);

    onMounted(() => {
        activeApps.value = store.state.activeApps.slice().reverse();
    });
</script>

<style scoped lang="scss">
    .ActiveAppsWindow {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: scroll;

        tr.Idle {
            color: grey;
        }

        .TD-Time {
            white-space: nowrap
        }

        .TD-Description {
            > div {
                max-width: 280px;
                overflow: hidden;
                white-space: nowrap;
            }
        }
    }
</style>
