import store from "./Store/Store";

const moment = require("moment");

class Timer {

    handle: any = 0;
    timeStart = 0;
    timeEnd = 0;

    isActive() {
        return !!this.handle;
    }

    start() {
        window.ipc.send('timer-state', 'active');
        if (!this.handle) {
            this.timeStart = moment.utc();
            store.commit.activateTimer();

            this.handle = setInterval(this.tick.bind(this), 1000);
            this.tick();
        }
    }

    tick() {
        store.commit.activeTimer(this.getSecondsElapsed(moment.utc()));

        console.log('timer tick');
    }

    stop(idleSeconds = 0) {
        window.ipc.send('timer-state', 'stopped');
        if (this.handle) {
            this.timeEnd = moment.utc();
            store.commit.stopTimer([this.getSecondsElapsed(this.timeEnd), idleSeconds * (store.state.is_debug ? 60 : 1)]);

            clearInterval(this.handle);
            this.handle = 0;
        }
    }

    getSecondsElapsed(timeEnd) {
        let timeElapsed = timeEnd - this.timeStart;
        return Math.round(timeElapsed / 1000) * (store.state.is_debug ? 60 : 1);
    }
}

const timer = new Timer();

export default timer;
