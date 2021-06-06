import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from '../ImpliedVol/TextCell';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from '../ImpliedVol/ImpliedVolTable.styles';
import tableStyles from '../TableStyles.styles';
import { IV_TABLE_GRAPH_HEIGHT, TABLE_WIDTH_IVOL, TABLE_HEIGHT, GROUP_ATTR } from '../constants';
import { useDashboardState, useDashboardDispatch } from '../selector';
import { RowGraphViewIv } from '../TimeSeries';


const moment = require('moment');
const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function SkewTable(props) {
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
        const newMomentObj = moment(date, "YYYY-MM-DD");

        const label = moment(newMomentObj).format('DD-MMM-YYYY');
        return {key: date, label};
    });

    const currentSubColoumn = [...GROUP_ATTR, ...expiryDatesColoumn];

    const _getTimeSeriesData = () => {
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

    const _handleColumnClickForGraph = (columnKey, colIndex, rowIndex, instrument_token, type) => {
        let colKey = columnKey;

        // console.log(colKey, colIndex, rowIndex, instrument_token);
        if(onClickedRow === rowIndex && colKey === selectedColumn) {
            onCloseGraph();
            return;
        }
        // _getTimeSeriesData();
        setClickedRow(rowIndex);
        setSelectedInstrument(instrument_token);
        setSelectedColumn(colKey);
    };

    return (
        <div>
            { _.get(expiryDates, 'length', 0) > 0 &&
                <section>
                    <p>SKEW</p>
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
                                getTimeSeriesData={props.getImpliedVolData}
                                tableGraphData={ivTimeseries}
                                onClickedRow={onClickedRow}
                                selectedInstrument={selectedInstrument}
                                defaultProducts={defaultProducts}
                                selectedColumn={selectedColumn}
                                type="skew"
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
                                            data={iVolData.data}
                                            colKey={column.key}
                                            colIndex={idx}
                                            eachCol={column}
                                            groupingAttribute={GROUP_ATTR}
                                            defaultProducts={defaultProducts}
                                            _handleColumnClickForGraph={_handleColumnClickForGraph}
                                            tableType="skew"
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