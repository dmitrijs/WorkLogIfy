import moment from "moment";

export function timespanToText(seconds, emptyValue = '-'): string {
    let sign = '';
    if (seconds < 0) {
        sign = '-';
        seconds *= -1;
    }
    // let result = String(seconds);
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds - hours * 3600) / 60);

    let result = '';
    if (hours > 0) {
        result += Math.floor(hours) + 'h ';
    }
    if (minutes > 0) {
        result += Math.floor(minutes) + 'm ';
    }
    if (!result) {
        result = emptyValue;
    }
    return sign + result.trim();
}

export function timespanToTextHours(seconds): string {
    let sign = '';
    if (seconds < 0) {
        sign = '-';
        seconds *= -1;
    }

    let hours = seconds / 3600;
    if (hours >= 1) {
        return (Math.round(hours * 10) / 10.0) + 'h';
    }

    let result = '';
    let minutes = (seconds - Math.floor(hours) * 3600) / 60;
    if (minutes > 0) {
        result += Math.floor(minutes) + 'm ';
    }
    if (!result) {
        return '-';
    }
    return sign + result.trim();
}

export function comparatorGt(a, b): number {
    return a > b ? 1 : a < b ? -1 : 0;
}

export function comparatorLt(a, b): number {
    return a > b ? -1 : a < b ? 1 : 0;
}

export function now() {
    return moment();
}
