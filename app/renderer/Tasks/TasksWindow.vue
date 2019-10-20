<template>
    <div>
        <div class="TasksTable">
            <div class="TRow --header">
                <div class="TCol --selected">
                    <div class="label-checkbox" @click="$store.commit('tasksUiToggle', task._key)">
                    <input type="checkbox"><span></span></div>
                </div>
                <div class="TCol --distributed"><i class="icofont-exchange"></i></div>
                <div class="TCol --chargeable"><i class="icofont-not-allowed"></i></div>
                <div class="TCol --logged"><i class="icofont-wall-clock"></i></div>
                <div class="TCol --code">ID</div>
                <div class="TCol --title">Title</div>
                <div class="TCol --time">Time</div>
            </div>
            <div class="TRow" v-for="task of tasks" @mouseenter="$store.commit('tasksUiHoveredId', task._key)">
                <div class="TCol --selected">
                    <div class="label-checkbox" @click="$store.commit('tasksUiToggle', task._key)">
                        <input type="checkbox" :checked="task._selected"><span></span></div>
                </div>
                <div class="TCol --distributed"><i class="IconAsInput icofont-exchange"></i></div>
                <div class="TCol --chargeable"><i class="IconAsInput icofont-not-allowed"></i></div>
                <div class="TCol --logged"><i class="IconAsInput icofont-wall-clock" @click="$store.commit('updateTask', [task._key, 'logged', 'YES'])"></i></div>
                <div class="TCol --code">{{task.code}}</div>
                <div class="TCol --title">
                    <span class="Title--Content ellipsis"><span>{{task.title}}</span></span>
                    <span class="Note--Content ellipsis"><span>I did this and that and then some more things that I should have done so it's good</span></span>
                </div>
                <div class="TCol --time">
                    {{task.time_charge_text}}<br/>
                    {{task.time_spent_text}}
                </div>
            </div>
        </div>

        <div class="Debug">
            {{ tasks_ui }}
            <hr/>
            {{ tasks }}
        </div>

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

        get tasks_ui() {
            return this.$store.getters.getTasksUi;
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
    @import "./TasksWindow";
</style>
