import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from './TextCell';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './ImpliedVolTable.styles';
import tableStyles from '../TableStyles.styles';
import { IV_TABLE_GRAPH_HEIGHT, TABLE_WIDTH_IVOL, TABLE_HEIGHT, GROUP_ATTR } from '../constants';
import { useDashboardState, useDashboardDispatch } from '../selector';
import { RowGraphViewIv } from '../TimeSeries';


const moment = require('moment');
const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function ImpliedVolTable(props) {
    const [onClickedRow, setClickedRow] = useState(-1);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);
    const {
        getIvTimeSeries,
    } = useDashboardDispatch();
    const { dashboard } = useDashboardState();

    const ivTimeseries = _.get(dashboard, 'ivTimeseries', {});
    const {expiryDates, iVolData, defaultProducts} = props;

    const expiryDatesColoumn = _.map(expiryDates, date => {
       return {key: date, label: date};
    });

    const currentSubColoumn = [...GROUP_ATTR, ...expiryDatesColoumn];
    const tableData = _.map(iVolData, (obj, key) => {
        // console.log(obj.data, key);
        return {key, data: obj.data, timestamp: _.get(obj.rawData, ['records', 'timestamp'], ''), underlyingValue: _.get(obj.rawData, ['records', 'underlyingValue'], '')};
    });

    const _getTimeSeriesData = () => {
        try {
            // console.log('inside _getTimeSeriesData');
            const products = defaultProducts.map( product => {
                return product.instrument_token;
            });

            getIvTimeSeries({ type: 'ivol', products});
        } catch(e) {
            console.log(e);
        }
    };

    const _subRowHeightGetter = (index) => {
        if (
            onClickedRow !== -1 &&
            onClickedRow == index
        ) {
            return IV_TABLE_GRAPH_HEIGHT;
        } else {
            return 0;
        }
    };

    const onCloseGraph = () => {
        setClickedRow(-1);
    };

    const _handleColumnClickForGraph = (columnKey, colIndex, rowIndex, instrument_token) => {
        let colKey = '';
        if (colIndex === 0 ) {
            colKey = columnKey;
        } else {
            const newMomentObj = moment(columnKey, "DD-MMM-YYYY");
            colKey = moment(newMomentObj).format('YYYY-MM-DD');
        }

        // console.log(colKey, colIndex, rowIndex, instrument_token);
        if(onClickedRow === rowIndex && colKey === selectedColumn) {
            onCloseGraph();
            return;
        }
        _getTimeSeriesData();
        setClickedRow(rowIndex);
        setSelectedInstrument(instrument_token);
        setSelectedColumn(colKey);
    };

    // console.log(expiryDatesColoumn, tableData);

    return (
        <div className={css(styles.DashboardWrapper)}>
            { _.get(expiryDates, 'length', 0) > 0 &&
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
                        height={onClickedRow === -1 ? TABLE_HEIGHT : TABLE_HEIGHT + IV_TABLE_GRAPH_HEIGHT}
                        overflowY="hidden"
                        overflowX="auto"
                        showScrollbarX={true}
                        keyboardScrollEnabled
                        subRowHeightGetter={_subRowHeightGetter}
                        rowExpanded={
                            <RowGraphViewIv
                                onCloseGraph={onCloseGraph}
                                getTimeSeriesData={_getTimeSeriesData}
                                tableGraphData={ivTimeseries}
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
            }
        </div>
    );
}

    // expiryDates={expiryDates}
    // iVolData={iVolData}