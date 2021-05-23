/**
 * Created by shashi.sh on 17/04/21.
 */

import { useSelector, useDispatch } from 'react-redux';
import {
    getRvolData,
    getConfig,
    getRvolContinuousData,
    getOptionChainNse,
    getTimeSeriesData,
    loadIvTimeSeries,
} from './Actions';

export const useDashboardState = () => {
    return {
        dashboard: useSelector(state => state.dashboard.toJS()),
    };
};

export const useDashboardDispatch = () => {
    const dispatch = useDispatch();
    return {
        dispatch: dispatch,
        getRvolData: params => dispatch(getRvolData(params)),
        getConfig: () => dispatch(getConfig()),
        getRvolContinuousData: params => dispatch(getRvolContinuousData(params)),
        getOptionChainNse: params => dispatch(getOptionChainNse(params)),
        getTimeSeriesData: params => dispatch(getTimeSeriesData(params)),
        getIvTimeSeries: params => dispatch(loadIvTimeSeries(params)),
    };
};
