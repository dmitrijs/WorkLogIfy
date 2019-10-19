<template>
    <div>
        Tasks
        <table class="table table-sm">
            <thead>
            <tr>
                <th title="Distributed"><i class="icofont-exchange"></i></th>
                <th title="Cannot charge"><i class="icofont-not-allowed"></i></th>
                <th title="Logged"><i class="icofont-wall-clock"></i></th>
                <th class="Column--Code">ID</th>
                <th class="Column--Title">Title</th>
                <th class="Column--Time">Time</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="task of tasks">
                <td><label class="label-checkbox"><input type="checkbox" :checked="task.distributed"><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox" :checked="task.chargeable"><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox" :checked="task.logged"><span></span></label></td>
                <td class="Column--Code">{{task.code}}</td>
                <td class="Column--Title">
                    <span class="Title--Content">{{task.title}}</span>
                    <span class="Note--Content">I did this and that and then some more things that I should have done so it's good</span>
                </td>
                <td class="Column--Time">
                    {{task.time_charge_text}}<br />
                    {{task.time_spent_text}}
                </td>
            </tr>
            </tbody>
        </table>

        {{ tasks }}
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    @Component({})
    export default class TasksWindow extends Vue {
        data() {
            return {}
        }

        get tasks() {
            return this.$store.getters.getTasks;
        }

        created() {
        }

        mounted() {
            this.createMenu();
        }

        run() {
            console.log(window.ipc.sendSync('window.open', 'Title 1')) // prints "pong"
        }

        createMenu() {

            console.log('creating');

            const remote = window.remote;
            const {Menu, MenuItem} = remote;

            const menu = new Menu();
            menu.append(new MenuItem({
                label: 'MenuItem1', click() {
                    console.log('item 1 clicked')
                }
            }));
            menu.append(new MenuItem({type: 'separator'}));
            menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}));


            window.addEventListener('contextmenu', (e) => {
                console.log('in context menu');
                e.preventDefault();
                menu.popup({window: remote.getCurrentWindow()})
            }, false);

            console.log('done');
        }
    }
</script>

<style scoped lang="scss">
    .Column--Code {
        white-space: nowrap;
    }

    .Column--Title {
        .Note--Content,
        .Title--Content {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 220px;
            display: block;
        }
    }

    .Column--Time {
        width: 70px;
    }

</style>
