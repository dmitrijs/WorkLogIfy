<template>
    <div class="MainMenu">
        <ul>
            <li @click="store.setScreen('tasks')"
                :class="{ Selected: store.state.screen === 'tasks' }"
            ><span><i class="icofont-tasks"></i> Tasks</span></li>
            <li @click="store.setScreen('active_apps')"
                :class="{ Selected: store.state.screen === 'active_apps' }"
            ><span><i class="icofont-clock-time"></i> Active Apps</span></li>
            <li @click="store.setScreen('calendar')"
                :class="{ Selected: store.state.screen === 'calendar' }"
            ><span><i class="icofont-calendar"></i> Calendar</span></li>
            <li @click="store.setScreen('settings')"
                :class="{ Selected: store.state.screen === 'settings' }"
            ><span><i class="icofont-settings-alt"></i> Settings</span></li>
            <li class="Hamburger"
                :class="{ Selected: store.state.screen === 'submenu' }"
            >
                <span @click="shownSubmenus.submenu = !shownSubmenus.submenu"><i class="icofont-navigation-menu"></i></span>
                <ul class="Submenu"
                    :class="{ Visible: shownSubmenus.submenu }"
                >
                    <li><span @click.stop="shownSubmenus.submenu = false; store.setScreen('todo')"><i class="icofont-listing-box"></i> <em>To-do</em></span></li>
                    <li><span @click.stop="shownSubmenus.submenu = false; store.setScreen('task.templates')"><i class="icofont-copy"></i> <em>Templates</em></span></li>
                    <li class="separator"></li>
                    <li>
                        <span @click.stop="shownSubmenus.submenu = false; quit()"><i class="icofont-exit"></i> <em>Quit</em> <i class="icofont-warning" v-if="store.state.taskTimeredId" title="Task is active!"></i></span>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
    import {reactive} from "vue";
    import store from "./Store/Store";

    const shownSubmenus = reactive({
        submenu: false,
    });

    function quit() {
        window.ipc.send('quit.unconfirmed');
    }
</script>

<style lang="scss">
    .MainMenu {
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: space-around;
            align-items: flex-end;
            border-bottom: 1px solid #e6e6e6;
        }

        ul li {
            width: 100%;
            display: flex;
            align-items: center;

            i {
                line-height: inherit;
            }

            span {
                height: 28px;
                line-height: 28px;
            }

            &.Selected {
                background: #e2e2e2;
            }

            &.Hamburger {
                width: auto;
                position: relative;

                > span {
                    padding-inline: 12px;
                }
            }
        }

        > ul > li {
            > span {
                width: 100%;
                text-align: center;
                cursor: pointer;
            }

            &:hover {
                background: #eee;
            }
        }

        ul.Submenu {
            display: none;

            min-width: 140px;
            position: absolute;
            top: 28px;
            right: 2px;
            border: 1px solid #e9e9e9;
            border-top: none;
            background: white;
            flex-direction: column;
            border-radius: 3px;
            box-shadow: 1px 1px 6px #bbbbbb;
            text-align: left;
            z-index: 1;

            &.Visible {
                display: flex;
            }

            li {
                min-width: 100px;
                justify-content: flex-start;

                span {
                    padding-left: 12px;
                    width: 100%;
                    margin: 2px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;

                    &:hover {
                        background: #eee;
                    }

                    em {
                        font-style: normal;
                        margin-left: 8px;
                        flex: 1;
                    }
                }

                .icofont-warning {
                    color: #fb3c3c;
                    font-size: 0.9rem;
                    padding-right: 6px;
                }
            }

            li.Separator {
                border-top: 1px solid #d7d7d7;
                height: 0;
            }
        }
    }
</style>
