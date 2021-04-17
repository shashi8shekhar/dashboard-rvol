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
