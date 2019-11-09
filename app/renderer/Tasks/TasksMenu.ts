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

export default menu;
