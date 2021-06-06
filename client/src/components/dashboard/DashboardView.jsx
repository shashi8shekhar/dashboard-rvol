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
            setInterval(getData, 300000);

            getImpliedVolData();
            setInterval(getImpliedVolData, 150000);
        }
    }, [productCount]);

    const getImpliedVolData = () => {
        try {
            console.log('inside set time interval getImpliedVolData');
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