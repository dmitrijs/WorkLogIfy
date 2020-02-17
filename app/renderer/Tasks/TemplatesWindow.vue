<template>
    <div class="TemplatesWindow">
        <div v-for="(template, index) of templates">
            <div class="actions">
                <i class="IconAsInput icofont-arrow-up"
                   @click="swap(index, index - 1)" v-if="(index - 1) >= 0"></i>
                <i class="IconAsInput icofont-arrow-down"
                   @click="swap(index, index + 1)" v-if="(index + 1) <= (templates.length - 1)"></i>

                <button type="button" @click="del(index)" class="btn btn-xs btn-danger">delete</button>
            </div>

            <label>Code:</label> <input type="text" placeholder="TSKS-0000" v-model="template.code" @change="update(index, template)"><br/>
            <label>Notes:</label> <input type="text" v-model="template.notes" @change="update(index, template)" style="width: 300px;"><br/>
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

        swap(idx1, idx2) {
            let templates = this.templates;
            let a = templates[idx1];
            let b = templates[idx2];

            store.commit.templateUpdate([idx2, a]);
            store.commit.templateUpdate([idx1, b]);
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

            .actions {
                float: right;
            }

            label {
                width: 38px;
            }
        }

        .IconAsInput {
            font-size: 17px;
            cursor: pointer;
        }
    }
</style>
