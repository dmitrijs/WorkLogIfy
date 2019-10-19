export function timespanToText(seconds) {
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
        result = '<1m';
    }
    return result.trim();
}
