/**
 * Created by shashi.sh on 17/04/21.
 */

import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';
import { ImpliedVolTable } from './ImpliedVol';
import { SkewTable } from './Skew';
import { RealizedVolTable } from './RealizedVol';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './DashboardView.styles';

import { useDashboardState, useDashboardDispatch } from './selector';

import '../../style/_fixed-data-table.scss';
const moment = require('moment');


export function DashboardView(props) {
    const { dashboard } = useDashboardState();

    const defaultProducts = _.get(dashboard, 'config.data.defaultProducts', []);
    const productCount = _.get(dashboard, 'config.data.defaultProducts.length', 0);

    const tableDataloading = _.get(dashboard, 'rVolData.loading', true);
    const tableStreamDataLoading = _.get(dashboard, 'rVolData.streamLoading', false);
    const tableData = _.get(dashboard, 'rVolData.data', []);

    const expiryDates = _.get(dashboard, 'expiryDates', []);
    const iVolData = _.get(dashboard, 'iVolData', []);

    const ivTimeseries = _.get(dashboard, 'ivTimeseries', {});
    // console.log('IV data new = ', ivTimeseries);

    const {
        getRvolData,
        getConfig,
        getRvolContinuousData,
        getIvTimeSeries,
    } = useDashboardDispatch();

    useEffect(() => {
        getConfig();
    }, []);

    useEffect(() => {
        const products = defaultProducts.map( product => {
            return product.instrument_token;
        });

        if (productCount) {
            getRvolData({ type: 'rvol', products});
            // clearCacheData();
            // setInterval(getData, 300000);

            getImpliedVolData();

            let currentDateObj = moment().utcOffset(330);
            let CurrentDate = moment().utcOffset(330).format();
            let momentTime = moment(CurrentDate).format("HH:mm:ss");
            let time = currentDateObj.hour();
            let dayOfWeek = currentDateObj.isoWeekday();
            let isWeekend = (dayOfWeek === 6) || (dayOfWeek  === 7); // 6 = Saturday, 7 = Sunday

            // console.log(momentTime, dayOfWeek, isWeekend, CurrentDate, time, currentDateObj.minutes())

            if ((time >= 9) && (time < 16 )) {
                let setIntervalId = setInterval(() => {
                    // make api call;
                    //clearCacheData();
                    getData();
                    getImpliedVolData();
                }, 300000);
            }

            // setInterval(getImpliedVolData, 150000);
        }
    }, [productCount]);

    // Function to clear complete cache data
    const clearCacheData = () => {
        caches.keys().then((names) => {
            names.forEach((name) => {
                caches.delete(name);
            });
        });
    };

    const getImpliedVolData = () => {
        try {
            // console.log('inside set time interval getImpliedVolData');
            const products = defaultProducts.map( product => {
                return product.instrument_token;
            });
            getIvTimeSeries({ type: 'ivol', products, expiryDates});
        } catch (e) {
            console.log(e);
        }
    };

    const getData = () => {
        try {
            // console.log('inside set time interval');
            const products = defaultProducts.map( product => {
                return product.instrument_token;
            });

            getRvolContinuousData({ type: 'rvol', products});
        } catch(e) {
            console.log(e);
        }
    };

    return (
        <div className={css(styles.DashboardWrapper)}>
            {tableDataloading ? (
                <CircularProgress />
            ) : !tableData.length ? (
                <p className={css(styles.transformCenter)}>No Data found</p>
            ) : (
                <section>
                    <div className={css(styles.ReloadButton)} onClick={(e) => { getData(); getImpliedVolData(); }}>
                        {
                            tableStreamDataLoading ? <span>Loading...</span> : <span>Reload</span>
                        }
                    </div>

                    <RealizedVolTable
                    />

                    <ImpliedVolTable
                        defaultProducts={defaultProducts}
                        expiryDates={expiryDates}
                        iVolData={ivTimeseries}
                        getImpliedVolData={getImpliedVolData}
                    />

                    <SkewTable
                        defaultProducts={defaultProducts}
                        expiryDates={expiryDates}
                        iVolData={ivTimeseries}
                        getImpliedVolData={getImpliedVolData}
                    />
                </section>
            )}
        </div>
    );
}