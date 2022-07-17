/**
 * Created by shashi.sh on 08/05/21.
 */

import React, { useState, useEffect } from 'react';

import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';

import CircularProgress from 'components/core/circularProgress/CircularProgress';
import { MultiLineStockChart } from 'components/core/HighChart';
import { calculatePercentage } from 'utils/helper';
import { graphTypeKeys } from '../../constants';
import Button, { ButtonTypes } from 'components/core/button/Button';
import styles from './RowGraphView.styles';
import '../../../../style/_common.scss'
const moment = require('moment');


export function RowGraphViewIv(props) {
    const { selectedColumn, selectedInstrument, onClickedRow, tableGraphData, type, defaultProducts, expiryDatesColoumn } = props;
    const currentData = _.get(tableGraphData, ['data', onClickedRow, 'data', selectedColumn, 'data'], []);
    const [graphType, setGraphType] = useState(type);


    const tradingObj = _.find(defaultProducts, {instrument_token: selectedInstrument});
    const tradingsymbol = _.get(tradingObj, ['tradingsymbol'], '-');

    const newMomentObj = moment(selectedColumn, "YYYY-MM-DD");
    const dateFormat = moment(newMomentObj).format('DD-MMM-YYYY');

    const getStrikes = (data) => {
        const lastData = _.get(data, [data.length - 1], {});
        const keys = Object.keys(lastData);

        const strikeList = _.filter(keys.map( item => {
            const splitKey = item.split('-');
            return splitKey.length > 1 ? splitKey[0] : null;
        }), (item) => {return item});

        strikeList.sort();
        const sortedStrikes = _.sortedUniq(strikeList);

        return sortedStrikes;
    };

    const strikeList = getStrikes(currentData);

    // console.log(currentData, strikeList);

    const changeGraphType = (type) => {
        setGraphType(type);
    };

    // console.log(selectedColumn, selectedInstrument, onClickedRow, tableGraphData, type , currentData);
    // console.log('tableGraphData = ', props.selectedInstrument, activeData, keys, keyMap);

    var title = type + ' time series. ( ' + tradingsymbol + ', ' + dateFormat + ' )',
        subtitle = '',
        series = [],
        xAxis = {},
        yAxis = { text: type, categories: []};

    if (graphType == 'skew') {
        if(selectedColumn === 'tradingsymbol') {
            const currentData = _.get(tableGraphData, ['data', onClickedRow, 'data'], []);
            const filterExpiryDatesColoumn = expiryDatesColoumn.filter( item => {
                return currentData[item.key];
            });
            let strikeListXAxis = [];

            series = filterExpiryDatesColoumn.map(item => {
                let expiryData = _.get(currentData, [item.key, 'data'], []);
                let lastData = _.get(expiryData, [expiryData.length - 1], {});
                let strikeList = getStrikes(expiryData);
                strikeListXAxis = _.uniq([...strikeListXAxis, ...strikeList]);

                // console.log(expiryData, strikeList, strikeListXAxis.sort());

                let data = _.filter(strikeList.map(strike => {
                    let iv = lastData[strike + '-iv'];
                    return iv > 0 ? iv : null;
                }), (d) => {return d});

                return {
                    name: item.label,
                    data,
                    yAxis: 0,
                    lineWidth: 2,
                };
            });
            strikeListXAxis.sort();
            xAxis = {
                text: 'Strike',
                categories: _.sortedUniq(strikeListXAxis),
            };
        } else {
            const lastData = _.get(currentData, [currentData.length - 1], {});
            series = [
                {
                    name: dateFormat,
                    data: _.filter(strikeList.map(strike => {
                        let iv = lastData[strike + '-iv'];
                        return iv > 0 ? iv : null;
                    }), (item) => {return item}),
                    yAxis: 0,
                    lineWidth: 2,
                }
            ];
            xAxis = {
                text: 'Strike',
                categories: strikeList,
            };
        }
    } else if(graphType === 'fixedStrikeVol') {
        series = [
            {
                name: type,
                data: _.get(tableGraphData, [onClickedRow, 'data'], []).map(data => {
                    const iv = data[selectedColumn + '-iv'];
                    return iv;
                }),
                yAxis: 0,
                lineWidth: 2,
            }
        ];
        xAxis = {
            text: 'Time',
            categories: _.get(tableGraphData, [onClickedRow, 'data'], []).map(data => {
                let time = moment.utc(data['dateTime']).format('DD-MMM HH:mm');
                return time;
            }),
        };
        title = type + ' time series. ( ' + tradingsymbol + ', ' + parseInt(selectedColumn) + ' )';

        // console.log(series, xAxis, tableGraphData);
    } else {
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
        ];
        xAxis = {
            text: 'Time',
            categories: currentData.map(data => {
                // const newMomentObj = moment(data['dateTime'], "DD-MMM-YYYY HH:mm:ss");
                let time = moment.utc(data['dateTime']).format('DD-MMM HH:mm');
                return time;
            }),
        };
    }

    // console.log(title, series, xAxis);

    if(props.rowIndex == props.onClickedRow && !props.tableGraphData.loading) {
        return (
            <div className={css(styles.RowGraphWrapper)}>
                <div className={css(styles.TableGraphActions)}>
                    {
                        type === 'skew' && (
                            <div className='skewToggleActionWrapper'>
                                <ul>
                                    {_.map(graphTypeKeys, item => {
                                        return (
                                            <li
                                                key={item.key}
                                                className={graphType === item.key ? 'active' : ''}
                                                onClick={e => {
                                                    changeGraphType(item.key);
                                                }}
                                            >
                                                <span>{item.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )
                    }

                    <div className={css(styles.TabActionButton)}>
                            <Button
                                className={'status-btn'}
                                text={'Reload'}
                                type={ButtonTypes.PRIMARY}
                                onClick={props.getTimeSeriesData}
                            ></Button>

                            <Button
                                text={'Close'}
                                type={ButtonTypes.LIGHT}
                                className="status-btn"
                                onClick={props.onCloseGraph}
                            ></Button>
                    </div>
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