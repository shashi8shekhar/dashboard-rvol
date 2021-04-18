/**
 * Created by shashi.sh on 18/04/21.
 */

import React from 'react';

import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';

import CircularProgress from 'components/core/circularProgress/CircularProgress';
import { calculatePercentage } from './utils';
import tableStyles from './TableStyles.styles';

const moment = require('moment');
const FixedDataTable = require('fixed-data-table-2');
const { Cell } = FixedDataTable;

export default function TextCell(props) {
    const {
        colIndex,
        data,
        rowIndex,
        colKey,
        eachCol,
        groupingAttribute,
        defaultProducts,
    } = props;

    console.log(colKey, eachCol, data[rowIndex]);

    if (colIndex === 0) {
        const instrument_token =  data[rowIndex]['instrument_token'];
        const { tradingsymbol } = _.find(defaultProducts, {instrument_token});

        const lastUpdatedDateObj = _.get(data, [rowIndex, 'data', 0, 'date'], '');
        const lastUpdatedDate = moment(lastUpdatedDateObj).format('DD MMM');
        const lastUpdatedTimeObj = _.get(data, [rowIndex, 'data', 0, 'range'], '');
        const lastUpdatedTime =  moment(lastUpdatedTimeObj, 'HH:mm:ss').format("HH:mm");

        return (
            <Cell className={css(tableStyles.eachCell)}>
                <div className={css(tableStyles.eachCellContentAlignEnd)}>
                    <div
                        className={classnames(css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.alignLeft), css(tableStyles.symbolCell) )}
                    >
                        <p className={css(tableStyles.symbolName)}>{tradingsymbol}</p>
                        <p className={css(tableStyles.lastUpdatedTime)}>{lastUpdatedDate}, {lastUpdatedTime}</p>
                    </div>
                </div>
            </Cell>
        );
    }

    return (
        <Cell className={css(tableStyles.eachCell)}>
            <div className={classnames( css(tableStyles.cellContent), css(tableStyles.SingleCellValue) )}>
                {calculatePercentage(data[rowIndex]['data'][0][colKey], 1, 2)}
            </div>
        </Cell>
    );
}