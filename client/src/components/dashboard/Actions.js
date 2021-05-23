/**
 * Created by shashi.sh on 17/04/21.
 */

import * as types from './ActionTypes';
import * as DashboardAPIUtil from 'utils/DashboardAPIUtil';

export function getRvolData(params) {
    return {
        types: [types.LOAD_RVOL_DATA, types.LOAD_RVOL_DATA_SUCCESS, types.LOAD_RVOL_DATA_FAIL],
        promise: DashboardAPIUtil.getRvolData(params),
        query: params,
    };
}

export function getConfig() {
    return {
        types: [types.LOAD_CONFIG_DATA, types.LOAD_CONFIG_DATA_SUCCESS, types.LOAD_CONFIG_DATA_FAIL],
        promise: DashboardAPIUtil.getConfig(),
    };
}

export function getRvolContinuousData(params) {
    return {
        types: [types.LOAD_RVOL_STREAM_DATA, types.LOAD_RVOL_STREAM_DATA_SUCCESS, types.LOAD_RVOL_STREAM_DATA_FAIL],
        promise: DashboardAPIUtil.getRvolData(params),
        query: params,
    };
}

export function getOptionChainNse(params) {
    return {
        types: [types.LOAD_NSE_OC, types.LOAD_NSE_OC_SUCCESS, types.LOAD_NSE_OC_FAIL],
        promise: DashboardAPIUtil.getOptionChainNse(params),
        query: params,
    };
}

export function getTimeSeriesData(params) {
    return {
        types: [types.LOAD_TIME_SERIES_DATA, types.LOAD_TIME_SERIES_DATA_SUCCESS, types.LOAD_TIME_SERIES_DATA_FAIL],
        promise: DashboardAPIUtil.getTimeSeriesData(params),
        query: params,
    };
}

export function loadIvTimeSeries(params) {
    return {
        types: [types.LOAD_IV_TIME_SERIES_DATA, types.LOAD_IV_TIME_SERIES_DATA_SUCCESS, types.LOAD_IV_TIME_SERIES_DATA_FAIL],
        promise: DashboardAPIUtil.loadIvTimeSeries(params),
        query: params,
    };
}

