<template>
    <div class="TemplatesWindow">
        <div v-for="(template, index) of templates">
            <button type="button" @click="del(index)" class="btn btn-xs btn-danger">delete</button>
            Code: <input type="text" placeholder="TSKS-0000" v-model="template.code" @change="update(index, template)"><br/>
            Notes: <input type="text" v-model="template.notes" @change="update(index, template)" style="width: 300px;"><br/>
        </div>

        <button type="button" class="btn btn-xs btn-secondary" @click="add()">+ add another</button>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";
    import store from "../Store/Store";

    @Component({
        created() {
            store.commit.setTaskTemplates(window.ipc.sendSync('tasks.getTaskTemplates'));
        },
    })
    export default class TemplatesWindow extends Vue {
        data() {
            return {}
        }

        get templates() {
            return store.getters.getTaskTemplates;
        }

        mounted() {
        }

        add() {
            store.commit.templateNew();
        }

        update(idx, obj) {
            store.commit.templateUpdate([idx, obj]);
        }

        del(idx) {
            store.commit.templateDelete([idx]);
        }
    }
</script>

<style scoped lang="scss">
    .TemplatesWindow {
        overflow-y: auto;
        max-height: 100%;

        > div {
            padding: 6px;
            border-bottom: 1px solid #E5E5E5;
            margin-bottom: 6px;

            .btn-danger {
                float: right;
            }
        }
    }
</style>
