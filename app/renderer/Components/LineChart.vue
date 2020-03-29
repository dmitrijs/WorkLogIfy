<template>
    <div class="LineChart progress" :style="'height: ' + height + 'px'">
        <div class="progress-bar" role="progressbar" :style="'width: ' + percent_normal + '%'"></div>
        <div class="progress-bar bg-warning" role="progressbar" :style="'width: ' + percent_warning + '%'"></div>
        <div class="progress-bar bg-success" role="progressbar" :style="'width: ' + percent_success + '%'"></div>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    @Component({
        props: {
            total: {
                type: Number,
                default: 100,
            },
            progress_normal: {
                type: Number,
                default: 0,
            },
            progress_warning: {
                type: Number,
                default: 0,
            },
            progress_success: {
                type: Number,
                default: 0,
            },
            height: {
                type: Number,
                default: 2,
            },
        },
    })
    export default class LineChart extends Vue {
        get percent_normal() {
            return Math.round(this.progress_normal * 100.0 / this.total);
        }

        get percent_warning() {
            return Math.round(this.progress_warning * 100.0 / this.total);
        }

        get percent_success() {
            return Math.round(this.progress_success * 100.0 / this.total);
        }
    }
</script>

<style scoped lang="scss">
    .LineChart {
        border-radius: 0;
    }

    .bg-success {
        background-color: #22ce49 !important;
    }
</style>
