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
        rowIndex,
        colKey,
        eachCol,
        groupingAttribute,
        defaultProducts,
        tableType
    } = props;

    const eachRow =  _.get(props.data, [rowIndex], null);
    const {data, instrument_token, expiry, last_close, last_updated} = eachRow;
    const dataLastObj = _.get(data, [data.length - 1], {});
    const dataPrevCloseObj = _.get(data, [last_close], {});

    // console.log(dataLastObj, dataPrevCloseObj, eachCol, expiry, last_close, last_updated);

    if (colIndex === 0) {
        const tradingObj = _.find(defaultProducts, {instrument_token});
        const tradingsymbol = _.get(tradingObj, ['tradingsymbol'], '-');
        const lastUpdatedDateObj = last_updated;

        const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();

        const lastUpdatedDate = moment(newMomentObj).format('DD MMM');
        const lastUpdatedTime =  moment(newMomentObj).format("HH:mm");

        const newMomentObjExpiry = moment(expiry, "YYYY-MM-DD");

        const label = moment(newMomentObjExpiry).format('DD-MMM-YYYY');

        // console.log(lastUpdatedDateObj, newMomentObj, lastUpdatedDate, lastUpdatedTime);

        return (
            <Cell className={classnames(css(tableStyles.eachCell), css(tableStyles.linkTextCell))} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token, tableType) }}>
                <div className={css(tableStyles.eachCellContentAlignEnd)}>
                    <div
                        className={classnames(css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.alignLeft), css(tableStyles.symbolCell) )}
                    >
                        <p className={css(tableStyles.symbolName)}>{label}</p>
                        <p className={css(tableStyles.lastUpdatedTime)}>{lastUpdatedDate}, {lastUpdatedTime}</p>
                    </div>
                </div>
            </Cell>
        );
    }

    const iv = _.get(dataLastObj, [(colKey + '-' + tableType)], '-');
    const ivPrev = _.get(dataPrevCloseObj, [(colKey + '-' + tableType)], '-');
    const ivChange = iv - ivPrev;

    const isAtm = _.get(dataLastObj, ['atm_strike'], '-') === eachCol.key;

    return (
        <Cell className={classnames(css(tableStyles.eachCell), css(tableStyles[isAtm ? 'isAtm' : 'noAtm']) )} onClick={ (e) => { props._handleColumnClickForGraph(colKey, colIndex, rowIndex, instrument_token, tableType) }}>
            <div className={classnames( css(tableStyles.cellContent), css(tableStyles.SingleCellValue), css(tableStyles.valueCell) )}>
                <span className={classnames(css(tableStyles.linkTextCell) )}>
                    { iv }
                </span>
                <span>
                    { (isNaN(ivChange) || ivChange === null) ? '-' : parseFloat(ivChange).toFixed(2) }
                </span>
            </div>
        </Cell>
    );
}