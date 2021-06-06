/**
 * Created by shashi.sh on 08/05/21.
 */

import React from 'react';

import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';

import CircularProgress from 'components/core/circularProgress/CircularProgress';
import { MultiLineStockChart } from 'components/core/HighChart';
import { calculatePercentage } from 'utils/helper';
import Button, { ButtonTypes } from 'components/core/button/Button';
import styles from './RowGraphView.styles';
const moment = require('moment');


export function RowGraphViewIv(props) {
    const { selectedColumn, selectedInstrument, onClickedRow, tableGraphData, type, defaultProducts } = props;
    const currentData = _.get(tableGraphData, ['data', onClickedRow, 'data', selectedColumn, 'data'], [])

    const tradingObj = _.find(defaultProducts, {instrument_token: selectedInstrument});
    const tradingsymbol = _.get(tradingObj, ['tradingsymbol'], '-');

    const newMomentObj = moment(selectedColumn, "YYYY-MM-DD");
    const dateFormat = moment(newMomentObj).format('DD-MMM-YYYY');

    // console.log(selectedColumn, selectedInstrument, onClickedRow, tableGraphData, type , currentData);
    // console.log('tableGraphData = ', props.selectedInstrument, activeData, keys, keyMap);

    const title = type + ' time series. ( ' + tradingsymbol + ', ' + dateFormat + ' )',
        subtitle = '',
        series = [
            {
                name: type,
                data: currentData.map(data => {
                    const atm_strike = data['atm_strike'];

                    const iv = data[atm_strike + '-iv'];
                    const skew = data['skew'];
                    return type === 'iv' ? iv : skew;
                }),
                yAxis: 0,
                lineWidth: 2,
            }
        ],
        xAxis = {
            text: 'Time',
            categories: currentData.map(data => {
                // const newMomentObj = moment(data['dateTime'], "DD-MMM-YYYY HH:mm:ss");
                let time = moment.utc(data['dateTime']).format('DD-MMM HH:mm');
                return time;
            }),
        },
        yAxis = { text: type, categories: []};

    // console.log(title, series, xAxis);

    if(props.rowIndex == props.onClickedRow && !props.tableGraphData.loading) {
        return (
            <div className={css(styles.RowGraphWrapper)}>
                <div className={css(styles.TableGraphActions)}>
                    <div className="tabActionButtonLeft">
                        <div>
                            <Button
                                className={'status-btn'}
                                text={'Reload'}
                                type={ButtonTypes.PRIMARY}
                                onClick={props.getTimeSeriesData}
                            ></Button>
                        </div>
                    </div>

                    <Button
                        text={'Close'}
                        type={ButtonTypes.LIGHT}
                        className="status-btn"
                        onClick={props.onCloseGraph}
                    ></Button>
                </div>
                <div className="mainGraph">
                    <MultiLineStockChart
                        series={series}
                        title={title}
                        xAxis={xAxis}
                        yAxis={yAxis}
                        subtitle={subtitle}
                    />
                 </div>
            </div>
        );
    } else {
        return null;
    }
}