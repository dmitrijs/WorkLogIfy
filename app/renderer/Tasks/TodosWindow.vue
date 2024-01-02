<template>
    <div class="TodosWindow">
        <button @click="store.loadAsanaTasks(true)">Refresh tasks list</button>
        <table>
            <thead>
            <tr>
                <th>section</th>
                <th>name</th>
            </tr>
            </thead>
            <tbody>
            <template v-for="task of tasks">
                <tr>
                    <td style="white-space: nowrap">
                        {{ task.assignee_section.name }}
                    </td>
                    <td>
                        <a :href="task.permalink_url" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
                        {{ task.name }}
                    </td>
                </tr>
            </template>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts" setup>
    import _ from "lodash";
    import {computed, onMounted} from "vue";
    import store from "../Store/Store";

    const tasks = computed(() => {
        return _.sortBy(store.state.asanaTasks, 'assignee_section.name');
    })
</script>

<style scoped lang="scss">
    .TodosWindow {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: scroll;
    }
</style>
