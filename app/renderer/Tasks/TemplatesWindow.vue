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

            <label>Title:</label> <input type="text" class="narrow" v-model="template.title" @change="update(index, template)">
            <label>Code:</label> <input type="text" class="narrow" placeholder="TSKS-0000" v-model="template.code" @change="update(index, template)"><br />
            <label>Notes:</label> <input type="text" v-model="template.notes" @change="update(index, template)" style="width: 300px;">
            <i class="IconAsInput icofont-not-allowed" :class="{ active: !template.chargeable }" @click="template.chargeable = !template.chargeable, update(index, template)"></i>
            <i class="IconAsInput icofont-exchange" :class="{ active: template.distributed }" @click="template.distributed = !template.distributed, update(index, template)"></i>
            <i class="IconAsInput icofont-unlock" :class="{ active: template.frozen }" @click="template.frozen = !template.frozen, update(index, template)"></i>
        </div>

        <button type="button" class="btn btn-xs btn-secondary" @click="add()">+ add another</button>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-facing-decorator";
    import store from "../Store/Store";

    @Component({})
    export default class TemplatesWindow extends Vue {
        data() {
            return {}
        }

        get templates() {
            return store.getTaskTemplates;
        }

        created() {
            store.setTaskTemplates(window.ipc.sendSync('tasks.getTaskTemplates'));
        }

        add() {
            store.templateNew();
        }

        update(idx, obj) {
            store.templateUpdate([idx, obj]);
        }

        del(idx) {
            store.templateDelete([idx]);
        }

        swap(idx1, idx2) {
            let templates = this.templates;
            let a = templates[idx1];
            let b = templates[idx2];

            store.templateUpdate([idx2, a]);
            store.templateUpdate([idx1, b]);
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
                margin-bottom: 0.3rem;
            }

            input[type=text].narrow {
                max-width: 127px;
            }

            .IconAsInput:not(.active) {
                opacity: 0.2;
            }
        }

        .IconAsInput {
            font-size: 17px;
            cursor: pointer;
        }
    }
</style>
