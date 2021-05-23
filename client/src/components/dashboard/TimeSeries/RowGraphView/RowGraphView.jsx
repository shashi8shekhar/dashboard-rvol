/**
 * Created by shashi.sh on 08/05/21.
 */

import React from 'react';

import classnames from 'classnames';
import _ from 'lodash';
import { css } from 'aphrodite';

import CircularProgress from 'components/core/circularProgress/CircularProgress';
import { MultiSeriesLineChart } from 'components/core/HighChart';

import Button, { ButtonTypes } from 'components/core/button/Button';
import styles from './RowGraphView.styles';

const moment = require('moment');


export function RowGraphView(props) {

    const activeData = _.find(props.tableGraphData.data, {instrument_token: props.selectedInstrument});
    const { selectedColumn } = props;
    // console.log('tableGraphData = ', props.selectedInstrument, activeData);

    if(props.rowIndex == props.onClickedRow && !props.tableGraphData.loading) {
        return (
        <div className={css(styles.RowGraphWrapper)}>
            <div className={css(styles.TableGraphActions)}>
                <div className="tabActionButtonLeft">
                    <div>
                        <Button
                            className={'status-btn'}
                            text={'Reload'}
                            type={ButtonTypes.PRIMARY}
                            onClick={props.getTimeSeriesData}
                        ></Button>
                    </div>
                </div>

                <Button
                    text={'Close'}
                    type={ButtonTypes.LIGHT}
                    className="status-btn"
                    onClick={props.onCloseGraph}
                ></Button>
            </div>
            <div className="mainGraph">
                <MultiSeriesLineChart
                    showLegends={ false }
                    graphData={ activeData }
                    selectedColumn={ selectedColumn }
                ></MultiSeriesLineChart>
            </div>
        </div>
        );
    } else {
        return null;
    }
}