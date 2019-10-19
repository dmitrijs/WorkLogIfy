<template>
    <div>
        Tasks
    </div>
</template>

<script type="ts">
    import Vue from "vue";

    export default class Win2 extends Vue {
        run() {
            console.log(window.ipc.sendSync('window.open', 'Title 1')) // prints "pong"
        }
    }
</script>
