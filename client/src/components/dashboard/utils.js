/**
 * Created by shashi.sh on 17/04/21.
 */


export function calculatePercentage(number, total, precision) {
    let percent = '-';
    if (
        isNaN(number) ||
        number === null ||
        !isFinite(number) ||
        isNaN(total) ||
        total === null ||
        !isFinite(total) ||
        total === 0
    ) {
        percent = '-';
    } else {
        percent = ((number / total) * 100).toFixed(precision) + '%';
    }
    return percent;
}