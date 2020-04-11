import store from "../Store/Store";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const menu = new Menu();
// menu.append(new MenuItem({
//     label: 'Start Timer', click() {
//         timer.start();
//     },
// }));
// menu.append(new MenuItem({
//     label: 'Stop Timer', click() {
//         timer.stop();
//     },
// }));
// menu.append(new MenuItem({type: 'separator'}));
menu.append(new MenuItem({
    label: 'Delete', click() {
        store.commit.deleteSelected();
    },
}));
menu.append(new MenuItem({
    type: 'separator',
}));
menu.append(new MenuItem({
    label: 'Copy tasks', click() {
        store.commit.clipboardCopySelected();
    },
}));
menu.append(new MenuItem({
    label: 'Cut tasks', click() {
        store.commit.clipboardCutSelected();
    },
}));
menu.append(new MenuItem({
    label: 'Paste tasks', click() {
        store.commit.clipboardPaste();
    },
}));

export default menu;
