<template>
    <div class="TasksLocations">
        win2 text123
        <button @click="run()">asdf</button>
    </div>
</template>

<script lang="ts">
    // import Vue from "vue";
    // import Component from "vue-class-component";
    import { ipcRenderer } from 'electron';

    export default {
        created() {
            console.log('created', ipcRenderer);
            //
            // ipcRenderer.on('asynchronous-reply', (event, arg) => {
            //     console.log(arg) // prints "pong"
            // })
        },

        methods: {
            run() {
                console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

                ipcRenderer.send('asynchronous-message', 'ping')
            },
        }
    }
</script>
