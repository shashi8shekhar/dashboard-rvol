/**
 * Created by shashi.sh on 08/05/21.
 */

import React from 'react';

import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';

import CircularProgress from 'components/core/circularProgress/CircularProgress';
import { MultiSeriesLineChart } from 'components/core/HighChart';

const moment = require('moment');


export function RowGraphView(props) {

    const activeData = _.find(props.tableGraphData.data, {instrument_token: props.selectedInstrument});
    // console.log('tableGraphData = ', props.selectedInstrument, activeData);

    if(props.rowIndex == props.onClickedRow && !props.tableGraphData.loading) {
        return (
            <div>
                <div className="mainGraph">
                    <MultiSeriesLineChart
                        showLegends={false}
                        graphData={activeData}
                    ></MultiSeriesLineChart>
                 </div>
            </div>
        );
    } else {
        return null;
    }
}