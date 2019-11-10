import store from "./Store/Store";

const moment = require("moment");

const remote = window.remote;

class Timer {

    handle: any = 0;
    timeStart = 0;
    timeEnd = 0;

    start() {
        if (!this.handle) {
            this.timeStart = moment.utc();
            store.commit('activateTimer');

            this.handle = setInterval(this.tick, 3000);
            this.tick();
        }
    }

    tick() {
        store.commit('activeTimer', Math.round((moment.utc() - this.timeStart) / 1000));

        console.log('timer tick');
    }

    stop() {
        if (this.handle) {
            this.timeEnd = moment.utc();
            let timeElapsed = this.timeEnd - this.timeStart;
            let secondsElapsed = Math.round(timeElapsed / 1000);
            store.commit('stopTimer', secondsElapsed);

            clearInterval(this.handle);
            this.handle = 0;
        }
    }
}

const timer = new Timer();

export default timer;
