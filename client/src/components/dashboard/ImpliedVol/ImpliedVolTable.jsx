import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from './TextCell';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './ImpliedVolTable.styles';
import tableStyles from '../TableStyles.styles';
import { TABLE_WIDTH_IVOL, TABLE_HEIGHT, GROUP_ATTR } from '../constants';
import { useDashboardState, useDashboardDispatch } from '../selector';

const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function ImpliedVolTable(props) {

    const {expiryDates, iVolData, defaultProducts} = props;

    const expiryDatesColoumn = _.map(expiryDates, date => {
       return {key: date, label: date};
    });

    const currentSubColoumn = [...GROUP_ATTR, ...expiryDatesColoumn];
    const tableData = _.map(iVolData, (obj, key) => {
        // console.log(obj.data, key);
        return {key, data: obj.data, timestamp: _.get(obj.rawData, ['records', 'timestamp'], ''), underlyingValue: _.get(obj.rawData, ['records', 'underlyingValue'], '')};
    });

    // console.log(expiryDatesColoumn, tableData);

    return (
        <div className={css(styles.DashboardWrapper)}>
            {!expiryDates.length ? (
                <CircularProgress small />
            ) : (
                <section>
                    {/*<div className={css(styles.ReloadButton)} onClick={(e) => { props.getData() }}>
                        {
                            tableStreamDataLoading ? <span>Loading Implied Vol...</span> : <span>Reload Implied Vol.</span>
                        }
                    </div>*/}
                    <Table
                        className={css(tableStyles.dashboardPivotTableWrapper)}
                        rowsCount={defaultProducts.length}
                        rowHeight={40}
                        headerHeight={60}
                        width={TABLE_WIDTH_IVOL}
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
                </section>
            )}
        </div>
    );
}

    // expiryDates={expiryDates}
    // iVolData={iVolData}