import timer from "../Timer";
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

export default menu;
