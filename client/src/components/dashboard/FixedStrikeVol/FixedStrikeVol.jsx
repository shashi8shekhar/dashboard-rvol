
/**
 * Created by shashi.sh on 13/07/22.
 */

import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import _ from 'lodash';
import Popover from '@material-ui/core/Popover';
import { css } from 'aphrodite';
import CircularProgress from 'components/core/circularProgress/CircularProgress';
import styles from './FixedStrikeVol.styles';
import { IV_TABLE_GRAPH_HEIGHT, TABLE_WIDTH_IVOL, TABLE_HEIGHT, GROUP_ATTR_FIXED_STRIKE_VOL } from '../constants';
import { getStrikes } from '../utils';
import { useDashboardState, useDashboardDispatch } from '../selector';
import {FixedStrikeVolTable} from './FixedStrikeVolTable';

const moment = require('moment');
const FixedDataTable = require('fixed-data-table-2');
const { Table, Column, Cell } = FixedDataTable;

export function FixedStrikeVol(props) {
    const {expiryDates, iVolData, defaultProducts} = props;

    const [onClickedRow, setClickedRow] = useState(-1);
    const [selectedInstrument, setSelectedInstrument] = useState(null);
    const selectedColumn = defaultProducts[0];

    const [currentSubColoumn, setCurrentSubColoumn] = useState(null);
    const [dataList, setDataList] = useState(null);

    const {
        getIvTimeSeries,
    } = useDashboardDispatch();
    const { dashboard } = useDashboardState();

    const ivTimeseries = _.get(dashboard, 'ivTimeseries', {});

    const expiryDatesReformat = _.map(expiryDates, date => {
        const newMomentObj = moment(date, "YYYY-MM-DD");

        const label = moment(newMomentObj).format('DD-MMM-YYYY');
        return {key: date, label};
    });

    const getPreviousDayIndex = (data) => {
        if (!data.length) {
            return -1;
        } else {
            let lastData = _.get(data, [data.length - 1], {});
            let time = moment.utc(lastData['dateTime']).format('YYYY-MM-DD');
            let lastIndex = -1;
            data.forEach( (item, idx) => {
                let item_time = moment.utc(item['dateTime']).format('YYYY-MM-DD');
                if(time === item_time) {
                    return lastIndex;
                }
                lastIndex = idx;
            });
            return lastIndex;
        }
    };

    useEffect(() => {
        let selectedInstrumentData =  _.find(ivTimeseries['data'], {instrument_token: selectedColumn.instrument_token});
        let dataList = _.filter(expiryDatesReformat.map( item => {
            let data = _.get(selectedInstrumentData, ['data', item.key], []);

            let prev_index = getPreviousDayIndex(_.get(data, ['data'], []));
            data.last_close = prev_index;
            data.last_updated = _.get(selectedInstrumentData, ['data', 'last_updated'], '');


            return data;
        }), (d) => {return d.data});;

        let expiryData = _.get(dataList, [0, 'data'], []);
        let lastData = _.get(expiryData, [expiryData.length - 1], {});
        let strikeList = getStrikes(expiryData);
        strikeList.sort();
        let strikeListFormat = strikeList.map( item => {
            return {key: item, label: item};
        });

        let currentSubColoumn = [...GROUP_ATTR_FIXED_STRIKE_VOL, ...strikeListFormat];

        setCurrentSubColoumn(currentSubColoumn);
        setDataList(dataList);

    }, [ iVolData ]);

    // console.log(ivTimeseries, selectedColumn, dataList, currentSubColoumn);

    return (
        <div>
            { _.get(currentSubColoumn, 'length', 0) > 0 &&
            <section>
                <div>
                    <p>FixedStrikeVol</p>
                </div>
                <div>
                    <FixedStrikeVolTable
                        columnList={currentSubColoumn}
                        data={dataList}
                        selectedInstrument={[selectedColumn]}
                        getImpliedVolData={props.getImpliedVolData}
                    />
                </div>
            </section>
            }
        </div>
    );
}