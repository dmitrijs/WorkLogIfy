<template>
    <div class="TasksLocations">
        win2 text123123
        <button @click="run()">open another window</button>
        <button @click="run()">open another window</button>
    </div>
</template>

<script lang="ts">
    import {Vue} from "vue-facing-decorator";

    export default class Win2 extends Vue {
        run() {
            console.log(window.ipc.sendSync('window.open', 'Title 1')) // prints "pong"
        }
    }
</script>
