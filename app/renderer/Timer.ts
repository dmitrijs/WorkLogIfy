import store from "./Store/Store";
import moment, {Moment} from "moment";

const {app} = window.remote;

let baseTitle;

function setTitle(timerActive = true) {
    document.title = baseTitle + ' v' + app.getVersion() + (timerActive ? '' : ' - INACTIVE');
}

class Timer {

    handle: any = 0;
    timeStart: Moment = null;
    timeEnd: Moment = null;

    init() {
        baseTitle = document.title;
        setTitle(this.isActive());
    }

    isActive() {
        return !!this.handle;
    }

    start(taskId = null) {
        let wasAlreadyActive = !!this.handle;
        if (wasAlreadyActive) {
            this.stop(0, false);
        }
        if (!this.handle) {
            this.timeStart = moment.utc();
            store.activateTimer(taskId);

            this.handle = setInterval(this.tick.bind(this), 1000);
            this.tick();
        }
        if (!wasAlreadyActive) {
            window.ipc.send('timer-state', 'active');
            setTitle(this.isActive());
        }
    }

    tick() {
        store.activeTimer(this.getSecondsElapsed(moment.utc()));
    }

    stop(idleSeconds = 0, sendEvent = true) {
        if (this.handle) {
            this.timeEnd = moment.utc();
            store.stopTimer([this.getSecondsElapsed(this.timeEnd), idleSeconds * (store.state.is_debug ? 60 : 1)]);

            clearInterval(this.handle);
            this.handle = 0;
        }
        if (sendEvent) {
            setTitle(false);
            window.ipc.send('timer-state', 'stopped');
        }
    }

    getSecondsElapsed(timeEnd: Moment) {
        let timeElapsed = timeEnd.unix() - this.timeStart.unix();
        return timeElapsed * (store.state.is_debug ? 60 : 1);
    }
}

const timer = new Timer();

export default timer;
