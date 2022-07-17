import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import TextCell from './TextCell';
import CircularProgress from 'components/core/circularProgress/CircularProgress'
import tableStyles from '../TableStyles.styles';
import { IV_TABLE_GRAPH_HEIGHT, TABLE_WIDTH_IVOL, TABLE_HEIGHT, GROUP_ATTR_FIXED_STRIKE_VOL } from '../constants';
import { useDashboardState, useDashboardDispatch } from '../selector';
import { RowGraphViewIv } from '../TimeSeries';


const moment = require('moment');
const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function FixedStrikeVolTable(props) {
    const [onClickedRow, setClickedRow] = useState(-1);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState(null);

    const {
        getIvTimeSeries,
    } = useDashboardDispatch();
    const { dashboard } = useDashboardState();

    const { columnList, data } = props;

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

    // console.log(data);
    const rowCount = _.get(data, ['length'], 0);
    const tableHeight = 80 + rowCount*40

    return (
        <div>
            <section>
                <Table
                    className={css(tableStyles.dashboardPivotTableWrapper)}
                    rowsCount={rowCount}
                    rowHeight={40}
                    headerHeight={60}
                    width={TABLE_WIDTH_IVOL}
                    height={onClickedRow === -1 ? tableHeight : tableHeight + IV_TABLE_GRAPH_HEIGHT}
                    overflowY="hidden"
                    overflowX="auto"
                    showScrollbarX={true}
                    keyboardScrollEnabled
                    subRowHeightGetter={_subRowHeightGetter}
                    rowExpanded={
                        <RowGraphViewIv
                            onCloseGraph={onCloseGraph}
                            getTimeSeriesData={props.getImpliedVolData}
                            tableGraphData={props.data}
                            onClickedRow={onClickedRow}
                            selectedInstrument={selectedInstrument}
                            selectedColumn={selectedColumn}
                            defaultProducts={props.selectedInstrument}
                            type="fixedStrikeVol"
                        />
                    }
                >
                    {columnList.map((column, idx) => {
                        return (
                            <Column
                                pureRendering
                                allowCellsRecycling
                                isReorderable={false}
                                columnKey={column.key}
                                fixed={idx < GROUP_ATTR_FIXED_STRIKE_VOL.length ? true : false}
                                header={
                                    <Cell className={css(tableStyles.tableHeader)}>
                                        <>
                                        <div className={css(tableStyles.tableHeaderInnerWrap)}>
                                            <div>{idx === 0 ? column.label : parseInt(column.label)}</div>
                                            {idx === 0 && <div className={css(tableStyles.lastUpdatedTimeLabel)}>Last time Updated</div>}
                                        </div>
                                    </>
                                    </Cell>
                                }
                                cell={
                                    <TextCell
                                        data={data}
                                        colKey={column.key}
                                        colIndex={idx}
                                        eachCol={column}
                                        groupingAttribute={GROUP_ATTR_FIXED_STRIKE_VOL}
                                        defaultProducts={props.selectedInstrument}
                                        _handleColumnClickForGraph={_handleColumnClickForGraph}
                                        tableType="iv"
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

        </div>
    );
}