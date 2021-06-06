/**
 * Created by shashi.sh on 17/04/21.
 */

import { Map, List, fromJS } from 'immutable';
import _ from 'lodash';

import {
    LOAD_RVOL_DATA,
    LOAD_RVOL_DATA_FAIL,
    LOAD_RVOL_DATA_SUCCESS,

    LOAD_CONFIG_DATA,
    LOAD_CONFIG_DATA_FAIL,
    LOAD_CONFIG_DATA_SUCCESS,

    LOAD_RVOL_STREAM_DATA,
    LOAD_RVOL_STREAM_DATA_SUCCESS,
    LOAD_RVOL_STREAM_DATA_FAIL,

    LOAD_NSE_OC,
    LOAD_NSE_OC_SUCCESS,
    LOAD_NSE_OC_FAIL,

    LOAD_TIME_SERIES_DATA,
    LOAD_TIME_SERIES_DATA_SUCCESS,
    LOAD_TIME_SERIES_DATA_FAIL,

    LOAD_IV_TIME_SERIES_DATA,
    LOAD_IV_TIME_SERIES_DATA_SUCCESS,
    LOAD_IV_TIME_SERIES_DATA_FAIL,
} from './ActionTypes';

import { _getAtmStrikePrice } from './utils';


var moment = require('moment');

const initialState = Map({
    rVolData: {
        loading: true,
        data: Map({}),
        error: '',
        streamLoading: false,
    },
    config: {
        loading: false,
        data: Map({}),
        error: '',
    },
    timeSeriesData: {
        loading: false,
        data: List(),
        error: '',
    },
    iVolData: Map({}),
    expiryDates: List(),
    ivTimeseries: {
        loading: false,
        data: List(),
        error: '',
    },
});

export default function dashboard(state = initialState, action) {
    switch (action.type) {
        case LOAD_CONFIG_DATA:
            return state.withMutations(state => {
                state.setIn(['config', 'loading'], true);
            });
        case LOAD_CONFIG_DATA_FAIL:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';

                state.setIn(['config', 'loading'], false);
                state.setIn(['config', 'error'], error);
            });
        case LOAD_CONFIG_DATA_SUCCESS:
            return state.withMutations(state => {
                const error = fromJS(action.result.result) ? '' : 'Oops, Something went wrong!';
                const result  = action.result;
                const configFormat = state.get('config');
                const expiryDates = _.get(result, 'expiryDates', []);
                expiryDates.sort();

                state.setIn(['config', 'data'], fromJS(result));
                state.setIn(['config', 'loading'], false);
                state.setIn(['config', 'error'], error);
                state.set( 'expiryDates', expiryDates );

                result['defaultProducts'].forEach(item => {
                    state.setIn(['iVolData', item.tradingsymbol], configFormat);
                });
            });

        case LOAD_RVOL_DATA:
            return state.withMutations(state => {
                state.setIn(['rVolData', 'loading'], true);
            });
        case LOAD_RVOL_DATA_FAIL:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';

                state.setIn(['rVolData', 'loading'], false);
                state.setIn(['rVolData', 'error'], error);
            });
        case LOAD_RVOL_DATA_SUCCESS:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';
                const result = action.result;

                state.setIn(['rVolData', 'data'], fromJS(result));
                state.setIn(['rVolData', 'loading'], false);
                state.setIn(['rVolData', 'error'], error);
            });

        case LOAD_RVOL_STREAM_DATA:
            return state.withMutations(state => {
                state.setIn(['rVolData', 'streamLoading'], true);
            });
        case LOAD_RVOL_STREAM_DATA_FAIL:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';

                state.setIn(['rVolData', 'streamLoading'], false);
                state.setIn(['rVolData', 'error'], error);
            });
        case LOAD_RVOL_STREAM_DATA_SUCCESS:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';
                const result = action.result;

                state.setIn(['rVolData', 'data'], fromJS(result));
                state.setIn(['rVolData', 'streamLoading'], false);
                state.setIn(['rVolData', 'error'], error);
            });

        case LOAD_NSE_OC:
            return state.withMutations(state => {
                state.setIn(['iVolData', action.query.body.symbol, 'loading'], true);
            });
        case LOAD_NSE_OC_FAIL:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';

                state.setIn(['iVolData', action.query.body.symbol, 'loading'], false);
                state.setIn(['iVolData', action.query.body.symbol, 'error'], error);
            });
        case LOAD_NSE_OC_SUCCESS:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';
                const result = action.result;

                // console.log(action.query.body.symbol, expiryDates, action);
                if(result) {

                    const underlyingValue = _.get(result, 'records.underlyingValue', null);
                    const strikePrices = _.get(result, 'records.strikePrices', []);

                    const atmStrike = _getAtmStrikePrice(underlyingValue, strikePrices);
                    const filteredData = _.filter(_.get(result, 'records.data', []), function(o) { return o.strikePrice === atmStrike; });

                    state.setIn(['iVolData', action.query.body.symbol, 'data'], filteredData);
                    state.setIn(['iVolData', action.query.body.symbol, 'rawData'], result);

                    state.setIn(['iVolData', action.query.body.symbol, 'loaded'], true);
                }

                state.setIn(['iVolData', action.query.body.symbol, 'loaded'], false);
                state.setIn(['iVolData', action.query.body.symbol, 'loading'], false);
                state.setIn(['iVolData', action.query.body.symbol, 'error'], error);
            });

        case LOAD_TIME_SERIES_DATA:
            return state.withMutations(state => {
                state.setIn(['timeSeriesData', 'loading'], true);
            });
        case LOAD_TIME_SERIES_DATA_FAIL:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';

                state.setIn(['timeSeriesData', 'loading'], false);
                state.setIn(['timeSeriesData', 'error'], error);
            });
        case LOAD_TIME_SERIES_DATA_SUCCESS:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';
                const result = action.result;

                state.setIn(['timeSeriesData', 'data'], fromJS(result));
                state.setIn(['timeSeriesData', 'loading'], false);
                state.setIn(['timeSeriesData', 'error'], error);
            });

        case LOAD_IV_TIME_SERIES_DATA:
            return state.withMutations(state => {
                state.setIn(['ivTimeseries', 'loading'], true);
            });
        case LOAD_IV_TIME_SERIES_DATA_FAIL:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';

                state.setIn(['ivTimeseries', 'loading'], false);
                state.setIn(['ivTimeseries', 'error'], error);
            });
        case LOAD_IV_TIME_SERIES_DATA_SUCCESS:
            return state.withMutations(state => {
                const error = fromJS(action.err) ? fromJS(action.err.message) : 'Oops, Something went wrong!';
                const result = action.result;

                state.setIn(['ivTimeseries', 'data'], fromJS(result));
                state.setIn(['ivTimeseries', 'loading'], false);
                state.setIn(['ivTimeseries', 'error'], error);
            });

        default:
            return state;
    }
}
