import timer from "../Timer";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const menu = new Menu();
menu.append(new MenuItem({
    label: 'Start Timer', click() {
        timer.start();
    },
}));
menu.append(new MenuItem({
    label: 'Stop Timer', click() {
        timer.stop();
    },
}));
menu.append(new MenuItem({type: 'separator'}));
menu.append(new MenuItem({
    label: 'MenuItem2', type: 'checkbox', checked: true, click() {
        console.log('item 2 clicked')
    },
}));

export default menu;
