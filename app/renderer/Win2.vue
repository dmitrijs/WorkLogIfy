<template>
    <div class="TasksLocations">
        win2 text123123
        <button @click="run()">asdf</button>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";

    export default class Win2 extends Vue {
        run() {
            console.log(window.ipc.sendSync('synchronous-message', 'ping')) // prints "pong"

            window.ipc.send('asynchronous-message', 'ping')
        }
    }
</script>
