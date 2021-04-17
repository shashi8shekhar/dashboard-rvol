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
    console.log('dashboard', dashboard);
    const configData = dashboard.config.data;

    const {
        getRvolData,
        getConfig,
    } = useFilterDispatch();

    useEffect(() => {
        getConfig();
    }, []);

    useEffect(() => {
        // getRvolData();
    }, [configData]);

    return (
        <div className={css(styles.DashboardWrapper)}>
            Main Dashboard
        </div>
    );
}
