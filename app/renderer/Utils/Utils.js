export function timespanToText(seconds) {
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
        result = '-';
    }
    return result.trim();
}


export function comparatorGt(a, b) {
    return a > b ? 1 : a < b ? -1 : 0;
}

export function comparatorLt(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
}