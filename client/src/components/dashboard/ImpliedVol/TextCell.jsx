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
        tableType
    } = props;

    const eachRowData =  _.get(data, [rowIndex, 'data'], null);
    const instrument_token =  _.get(data, [rowIndex, 'instrument_token'], null);

    // console.log(colKey, eachRowData);

    if (colIndex === 0) {
        const tradingObj = _.find(defaultProducts, {instrument_token});
        const tradingsymbol = _.get(tradingObj, ['tradingsymbol'], '-');
        const lastUpdatedDateObj = _.get(eachRowData, ['last_updated'], '');

        const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();

        const lastUpdatedDate = moment(newMomentObj).format('DD MMM');
        const lastUpdatedTime =  moment(newMomentObj).format("HH:mm");

        // console.log(lastUpdatedDateObj, newMomentObj, lastUpdatedDate, lastUpdatedTime);

        return (
            <Cell className={classnames(css(tableStyles.eachCell), css(tableStyles.linkTextCell))} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token, tableType) }}>
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

    const iv = _.get(eachRowData, [colKey, tableType], '-');

    return (
        <Cell className={classnames(css(tableStyles.eachCell) )} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token, tableType) }}>
            <div className={classnames( css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.linkTextCell) )}>
                { iv }
            </div>
        </Cell>
    );
}