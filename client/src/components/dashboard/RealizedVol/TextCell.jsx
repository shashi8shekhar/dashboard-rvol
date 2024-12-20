/**
 * Created by shashi.sh on 18/04/21.
 */

import React from 'react';

import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';

import CircularProgress from 'components/core/circularProgress/CircularProgress';
import { calculatePercentage } from '../utils';
import tableStyles from '../TableStyles.styles';

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

    // console.log(colKey, eachCol, data[rowIndex]);
    const instrument_token =  _.get(data, [rowIndex, 'instrument_token'], null);

    if (colIndex === 0) {
        const { tradingsymbol } = _.find(defaultProducts, {instrument_token});

        const lastUpdatedDateObj = _.get(data, [rowIndex, 'data', 0, 'dateTime'], '');
        const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();

        const lastUpdatedDate = moment(newMomentObj).format('DD MMM');
        const lastUpdatedTime =  moment(newMomentObj).format("HH:mm");

        return (
            <Cell className={classnames(css(tableStyles.eachCell), css(tableStyles.linkTextCell))} onClick={ (e) => props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token) }>
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
        <Cell className={classnames(css(tableStyles.eachCell) )} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token) }}>
            <div className={classnames( css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.linkTextCell) )}>
                {calculatePercentage(_.get(data, [rowIndex, 'data', 0, colKey], null), 1, 2)}
            </div>
        </Cell>
    );
}