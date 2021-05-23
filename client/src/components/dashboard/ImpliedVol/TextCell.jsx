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
    const instrument_token =  _.get(defaultProducts, [rowIndex, 'instrument_token'], null);

    if (colIndex === 0) {

        const lastUpdatedDateObj = _.get(data, [rowIndex, 'timestamp'], '');

        const newMomentObj = moment(lastUpdatedDateObj, "DD-MMM-YYYY HH:mm:ss");

        const lastUpdatedDate = moment(newMomentObj).format('DD MMM');
        const lastUpdatedTime =  moment(newMomentObj).format("HH:mm");

        // console.log(lastUpdatedDateObj, newMomentObj, lastUpdatedDate, lastUpdatedTime);

        return (
            <Cell className={classnames(css(tableStyles.eachCell), css(tableStyles.linkTextCell))} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token) }}>
                <div className={css(tableStyles.eachCellContentAlignEnd)}>
                    <div
                        className={classnames(css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.alignLeft), css(tableStyles.symbolCell) )}
                    >
                        <p className={css(tableStyles.symbolName)}>{_.get(data, [rowIndex, 'key'], '')}</p>
                        <p className={css(tableStyles.lastUpdatedTime)}>{lastUpdatedDate}, {lastUpdatedTime}</p>
                    </div>
                </div>
            </Cell>
        );
    }

    const cellObj = _.find( _.get(data, [rowIndex, 'data'], []), {expiryDate: colKey} );
    const ivCall = _.get(cellObj, ['CE', 'impliedVolatility'], null);
    const ivPut = _.get(cellObj, ['PE', 'impliedVolatility'], null);
    const iv = ivCall || ivPut || '-';

    return (
        <Cell className={classnames(css(tableStyles.eachCell) )} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token) }}>
            <div className={classnames( css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.linkTextCell) )}>
                { iv }
            </div>
        </Cell>
    );
}