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
                @click="shownSubmenus.submenu = !shownSubmenus.submenu"
            ><span><i class="icofont-navigation-menu"></i></span>
                <ul class="Submenu"
                    :class="{ Visible: shownSubmenus.submenu }"
                >
                    <li @click="quit()">Quit</li>
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

        li {
            width: 100%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 28px;
            line-height: 24px;

            &:hover {
                background: #eee;
            }

            &.Selected {
                background: #e2e2e2;
            }

            &.Hamburger {
                width: auto;
                padding-inline: 12px;
                position: relative;
            }
        }

        .Submenu {
            display: none;

            position: absolute;
            top: 28px;
            right: 0;
            border: 1px solid #e9e9e9;
            border-top: none;
            background: white;
            flex-direction: column;

            &.Visible {
                display: flex;
            }

            li {
                min-width: 100px;
            }
        }
    }
</style>
