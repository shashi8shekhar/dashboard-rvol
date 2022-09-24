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

export const getStrikes = (data) => {
    const lastData = _.get(data, [data.length - 5], {});
    const keys = Object.keys(lastData);

    const strikeList = _.filter(keys.map( item => {
        const splitKey = item.split('-');
        return splitKey.length > 1 ? splitKey[0] : null;
    }), (item) => {return item});

    strikeList.sort();
    const sortedStrikes = _.sortedUniq(strikeList);

    return sortedStrikes;
};