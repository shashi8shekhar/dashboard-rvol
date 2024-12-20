/**
 * Created by shashi.sh on 17/04/21.
 */

import _ from 'lodash';

export function calculatePercentage(number, total, precision, hideSign) {
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
        percent = ((number / total) * 100).toFixed(precision);
        percent += hideSign ? '' : '%';
    }
    return percent;
}

export function _getAtmStrikePrice(underlyingValue, strikePrices) {
    return strikePrices.sort( (a,b) => Math.abs(underlyingValue - a) - Math.abs(underlyingValue - b) )[0];
}