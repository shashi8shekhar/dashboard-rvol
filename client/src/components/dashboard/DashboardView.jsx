/**
 * Created by shashi.sh on 17/04/21.
 */

import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from './TextCell';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './DashboardView.styles';
import tableStyles from './TableStyles.styles';
import { TABLE_WIDTH, TABLE_HEIGHT, GROUP_ATTR } from './constants';
import { useDashboardState, useDashboardDispatch } from './selector';

import '../../style/_fixed-data-table.scss';

const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function DashboardView(props) {
    const { dashboard } = useDashboardState();

    const mainTableConfig = _.get(dashboard, ['config', 'data', 'mainTableConfig'], []);
    const defaultProducts = _.get(dashboard, 'config.data.defaultProducts', []);
    const productCount = _.get(dashboard, 'config.data.defaultProducts.length', 0);
    const tableDataloading = _.get(dashboard, 'rVolData.loading', true);
    const tableData = _.get(dashboard, 'rVolData.data', []);
    const currentSubColoumn = [...GROUP_ATTR, ...mainTableConfig];

    const {
        getRvolData,
        getConfig,
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
        }
    }, [productCount]);

    console.log(defaultProducts, mainTableConfig);
    console.log(tableDataloading, tableData, currentSubColoumn);

    return (
        <div className={css(styles.DashboardWrapper)}>
            {tableDataloading ? (
                <CircularProgress />
            ) : !tableData.length ? (
                <p className={css(styles.transformCenter)}>No Data found</p>
            ) : (
                <section>
                    <Table
                        className={css(tableStyles.dashboardPivotTableWrapper)}
                        rowsCount={tableData.length}
                        rowHeight={40}
                        headerHeight={40}
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
                </section>
            )}
        </div>
    );
}