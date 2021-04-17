/**
 * Created by shashi.sh on 17/04/21.
 */

import React, { useState, useEffect } from 'react';
import classnames from 'classnames';

import _ from 'lodash';

import Popover from '@material-ui/core/Popover';

import { css } from 'aphrodite';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './DashboardView.styles';

import { useFilterState, useFilterDispatch } from './selector';

export function DashboardView(props) {
    const { dashboard } = useFilterState();

    const mainTableConfig = _.get(dashboard, ['config', 'data', 'mainTableConfig'], []);
    const defaultProducts = _.get(dashboard, 'config.data.defaultProducts', []);
    const productCount = _.get(dashboard, 'config.data.defaultProducts.length', 0);

    const {
        getRvolData,
        getConfig,
    } = useFilterDispatch();

    useEffect(() => {
        getConfig();
    }, []);

    useEffect(() => {

        const products = defaultProducts.map( product => {
            return product.instrument_token;
        });

        if (productCount) {
            getRvolData({ type: 'rvol', products});
        }
    }, [productCount]);

    console.log(defaultProducts, mainTableConfig);

    return (
        <div className={css(styles.DashboardWrapper)}>
            Main Dashboard
        </div>
    );
}
