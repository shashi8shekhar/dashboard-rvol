import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from './TextCell';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './RealizedVolTable.styles';
import tableStyles from '../TableStyles.styles';
import { TABLE_GRAPH_HEIGHT, TABLE_WIDTH, TABLE_HEIGHT, GROUP_ATTR } from '../constants';
import { useDashboardState, useDashboardDispatch } from '../selector';
import { RowGraphView } from '../TimeSeries'

const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;
const moment = require('moment');

export function RealizedVolTable(props) {
    const [onClickedRow, setClickedRow] = useState(-1);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);

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

    const timeSeriesData = _.get(dashboard, 'timeSeriesData', {});

    // console.log('timeSeriesData = ', timeSeriesData);

    const {
        getRvolData,
        getConfig,
        getRvolContinuousData,
        getTimeSeriesData,
    } = useDashboardDispatch();


    const _getTimeSeriesData = () => {
        try {
            // console.log('inside set time interval');
            const products = defaultProducts.map( product => {
                return product.instrument_token;
            });

            getTimeSeriesData({ type: 'rvol', products});
        } catch(e) {
            console.log(e);
        }
    };

    const _subRowHeightGetter = (index) => {
        if (
            onClickedRow !== -1 &&
            onClickedRow == index
        ) {
            return TABLE_GRAPH_HEIGHT;
        } else {
            return 0;
        }
    };

    const onCloseGraph = () => {
        setClickedRow(-1);
    };

    const _handleColumnClickForGraph = (columnKey, colIndex, rowIndex, instrument_token) => {
        if(onClickedRow === rowIndex && columnKey === selectedColumn) {
            onCloseGraph();
            return;
        }

        _getTimeSeriesData();
        setClickedRow(rowIndex);
        setSelectedInstrument(instrument_token);
        setSelectedColumn(columnKey);
    };

    return (
            <section>
                <p>RVOL</p>
                <Table
                    className={css(tableStyles.dashboardPivotTableWrapper)}
                    rowsCount={tableData.length}
                    rowHeight={40}
                    headerHeight={60}
                    width={TABLE_WIDTH}
                    height={onClickedRow === -1 ? TABLE_HEIGHT : TABLE_HEIGHT + TABLE_GRAPH_HEIGHT}
                    overflowY="auto"
                    overflowX="auto"
                    showScrollbarX={true}
                    keyboardScrollEnabled
                    subRowHeightGetter={_subRowHeightGetter}
                    rowExpanded={
                        <RowGraphView
                            onCloseGraph={onCloseGraph}
                            getTimeSeriesData={_getTimeSeriesData}
                            tableGraphData={timeSeriesData}
                            onClickedRow={onClickedRow}
                            selectedInstrument={selectedInstrument}
                            selectedColumn={selectedColumn}
                        />
                    }
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
                                        _handleColumnClickForGraph={_handleColumnClickForGraph}
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
    );
}