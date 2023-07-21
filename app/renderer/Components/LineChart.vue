<template>
    <div class="LineChart progress" :style="'height: ' + height + 'px'">
        <div class="progress-bar bg-normal" role="progressbar" :style="'width: ' + percent_normal + '%'"></div>
        <div class="progress-bar bg-info" role="progressbar" :style="'width: ' + percent_info + '%'"></div>
        <div class="progress-bar bg-warning" role="progressbar" :style="'width: ' + percent_warning + '%'"></div>
        <div class="progress-bar bg-success" role="progressbar" :style="'width: ' + percent_success + '%'"></div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Vue} from "vue-facing-decorator";

    @Component({})
    export default class LineChart extends Vue {
        @Prop
        total = 100;
        @Prop
        progress_normal = 0;
        @Prop
        progress_info = 0;
        @Prop
        progress_warning = 0;
        @Prop
        progress_success = 0;
        @Prop
        height = 2;

        get percent_normal() {
            return Math.round(this.progress_normal * 100.0 / this.total);
        }

        get percent_info() {
            return Math.round(this.progress_info * 100.0 / this.total);
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

        &.progress-bar--no-transition {
            .progress-bar {
                transition: none;
            }
        }
    }

    .bg-success {
        background-color: #22ce49 !important;
    }

    .bg-normal {
        background-color: #c8e3ff;
    }

    .bg-dark {
        background-color: #dedede !important;
    }
</style>
