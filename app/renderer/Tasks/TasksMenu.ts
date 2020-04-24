import store from "../Store/Store";

const remote = window.remote;
const {Menu, MenuItem} = remote;

const menu = new Menu();

menu.append(new MenuItem({
    label: 'View in JIRA', click() {
        if (store.state.tasksSelectedIds.size !== 1) {
            return;
        }

        let taskId = store.state.tasksSelectedIds.keySeq().first();
        let code = store.state.tasks.get(taskId).get('code');

        if (code) {
            let url = store.state.settings.get('jira_host') + '/browse/' + code;
            window.open(url);
        }

        store.commit.deselectAll();
    },
}));
menu.append(new MenuItem({
    type: 'separator',
}));
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
