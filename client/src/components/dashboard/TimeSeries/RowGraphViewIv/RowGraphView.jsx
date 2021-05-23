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

    const activeData = _.find(props.tableGraphData.data, {instrument_token: props.selectedInstrument});
    let keys = Object.keys( _.get(activeData, ['data', 0], {}) );
    let keyMap = {};

    const { selectedColumn } = props;
    if(selectedColumn !== 'tradingsymbol') {
        keys = keys.filter(key => {
                    return key === (selectedColumn + '_iv');
                });
    }

    keys.forEach(key => {
        let keySplit = key.split('_');
        if(keySplit.indexOf('iv') !== -1) {
            let len = (_.get(activeData, ['data'], [])).length;
            let isZeroIndex = _.findIndex(_.get(activeData, ['data'], []), (e) => {
                return parseInt( e[key] ) === 0;
            }, 0);

            let day = moment(keySplit[0]).format('DD-MMM-YYYY ');
            keyMap[day] = {
                val: key,
                type: 'iv',
                isActive: isZeroIndex === -1 || selectedColumn !== 'tradingsymbol' ? true : false,
            };
        } else if (keySplit.length === 1 && (key !== 'dateTime' && key !== 'strike') ) {
            keyMap[key] = {
                val: key,
                type: 'price',
                isActive: true,
            };
        }
    });
    // console.log('tableGraphData = ', props.selectedInstrument, activeData, keys, keyMap);

    const title = 'IV using CE price of closest strike(5 Min).',
        subtitle = '',
        series = _.filter(Object.keys(keyMap).map(gd => {
            if( keyMap[gd]['isActive'] ) {
                return {
                    name: gd,
                    data: _.get(activeData, ['data'], []).map(data => {
                        return parseFloat( data[ keyMap[gd]['val'] ] );
                    }),
                    yAxis: keyMap[gd]['type'] === 'iv' ? 1 : 0,
                    lineWidth: keyMap[gd]['type'] === 'iv' ? 2 : 1,
                };
            }
        }), item => { return item}),
        xAxis = {
            text: 'Time',
            categories: _.get(activeData, ['data'], []).map(data => {
                // const newMomentObj = moment(data['dateTime'], "DD-MMM-YYYY HH:mm:ss");
                const newMomentObj = moment.utc(data['dateTime']).format('DD-MMM HH:mm');

                // const lastUpdatedDate = moment(newMomentObj).format('DD MMM');
                return newMomentObj;
            }),
        },
        yAxis = { text: 'Time', categories: []};

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