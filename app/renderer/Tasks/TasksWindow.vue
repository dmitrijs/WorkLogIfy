<template>
    <div>
        Tasks
        <table class="table table-sm">
            <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th title="Distributed"><i class="icofont-exchange"></i></th>
                <th title="Cannot charge"><i class="icofont-not-allowed"></i></th>
                <th title="Logged"><i class="icofont-wall-clock"></i></th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>TSKS-1243</td>
                <td>Add some tasks to some tasks for some tasks</td>
                <td><label class="label-checkbox"><input type="checkbox" checked><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox"><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox"><span></span></label></td>
            </tr>
            <tr>
                <td>TSKS-1111</td>
                <td>Create task from some sentence and that is it</td>
                <td><label class="label-checkbox"><input type="checkbox"><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox" checked><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox"><span></span></label></td>
            </tr>
            <tr>
                <td>TSKS-3333</td>
                <td>Blog creation</td>
                <td><label class="label-checkbox"><input type="checkbox" checked><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox" checked><span></span></label></td>
                <td><label class="label-checkbox"><input type="checkbox" checked><span></span></label></td>

            </tr>
            </tbody>
        </table>
    </div>
</template>

<script type="ts">
    import Vue from "vue";
    import Component from "vue-class-component";

    @Component({})
    export default class TasksWindow extends Vue {
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
            }, false)

            console.log('done');

        }
    }
</script>

<style>
</style>
