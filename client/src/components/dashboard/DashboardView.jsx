/**
 * Created by shashi.sh on 17/04/21.
 */

import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from './TextCell';
import {ImpliedVolTable} from './ImpliedVol';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './DashboardView.styles';
import tableStyles from './TableStyles.styles';
import { TABLE_WIDTH, TABLE_HEIGHT, GROUP_ATTR } from './constants';
import { useDashboardState, useDashboardDispatch } from './selector';

import '../../style/_fixed-data-table.scss';

// import CachedIcon from '@material-ui/icons/Cached';

const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function DashboardView(props) {
    const { dashboard } = useDashboardState();

    const mainTableConfig = _.get(dashboard, ['config', 'data', 'mainTableConfig'], []);
    const defaultProducts = _.get(dashboard, 'config.data.defaultProducts', []);
    const productCount = _.get(dashboard, 'config.data.defaultProducts.length', 0);

    const tableDataloading = _.get(dashboard, 'rVolData.loading', true);
    const tableStreamDataLoading = _.get(dashboard, 'rVolData.streamLoading', false);
    const tableData = _.get(dashboard, 'rVolData.data', []);
    const currentSubColoumn = [...GROUP_ATTR, ...mainTableConfig];

    const expiryDates = _.get(dashboard, 'expiryDates', []);
    const iVolData = _.get(dashboard, 'iVolData', []);

    // console.log(expiryDates, iVolData);

    const {
        getRvolData,
        getConfig,
        getRvolContinuousData,
        getOptionChainNse,
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
            setInterval(getImpliedVolData, 500000);
        }
    }, [productCount]);

    const getImpliedVolData = () => {
        try {
            defaultProducts.forEach( (item, idx) => {
                setTimeout(function(product) {
                    let params = {
                        body: {
                            symbol: product.tradingsymbol,
                            type: product.segment === 'INDICES' ? 'indices' : 'equities',
                        },
                    };
                    getOptionChainNse( params );
                }, idx * 5000, item);
            });
        } catch (e) {
            console.log(e);
        }
    };

    const getData = () => {
        try {
            console.log('inside set time interval');
            const products = defaultProducts.map( product => {
                return product.instrument_token;
            });

            getRvolContinuousData({ type: 'rvol', products});
        } catch(e) {
            console.log(e);
        }
    };

    // console.log(defaultProducts, mainTableConfig);
    // console.log(tableDataloading, tableData, currentSubColoumn);

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
                    <Table
                        className={css(tableStyles.dashboardPivotTableWrapper)}
                        rowsCount={tableData.length}
                        rowHeight={40}
                        headerHeight={60}
                        width={TABLE_WIDTH}
                        height={TABLE_HEIGHT}
                        overflowY="hidden"
                        overflowX="auto"
                        showScrollbarX={true}
                        keyboardScrollEnabled
                    >
                        {currentSubColoumn.map((column, idx) => {
                            return (
                                <Column
                                    pureRendering
                                    allowCellsRecycling
                                    isReorderable={false}
                                    columnKey={column.key}
                                    fixed={idx < GROUP_ATTR.length ? true : false}
                                    header={
                                        <Cell className={css(tableStyles.tableHeader)}>
                                            <>
                                                <div className={css(tableStyles.tableHeaderInnerWrap)}>
                                                    <div>{column.label}</div>
                                                    {idx === 0 && <div className={css(tableStyles.lastUpdatedTimeLabel)}>Last time Updated</div>}
                                                </div>
                                            </>
                                        </Cell>
                                    }
                                    cell={
                                        <TextCell
                                            data={tableData}
                                            colKey={column.key}
                                            colIndex={idx}
                                            eachCol={column}
                                            groupingAttribute={GROUP_ATTR}
                                            defaultProducts={defaultProducts}
                                        />
                                    }
                                    width={100}
                                    key={column.key + '_' + idx}
                                    isResizable={idx === 0 ? true : false}
                                />
                            )
                        })}
                    </Table>

                    <ImpliedVolTable
                        defaultProducts={defaultProducts}
                        expiryDates={expiryDates}
                        iVolData={iVolData}
                    />
                </section>
            )}
        </div>
    );
}