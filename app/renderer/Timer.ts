import store from "./Store/Store";

const remote = window.remote;

class Timer {

    handle: any = 0;

    start() {
        if (!this.handle) {
            store.commit('activateTimer');
            this.handle = setInterval(() => {
                console.log('timer tick');
            }, 3000);
        }
    }

    stop() {
        store.commit('stopTimer');
        if (this.handle) {
            clearInterval(this.handle);
            this.handle = 0;
        }
    }
}

const timer = new Timer();

export default timer;
