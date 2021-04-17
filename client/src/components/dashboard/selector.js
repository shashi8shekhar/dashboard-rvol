/**
 * Created by shashi.sh on 17/04/21.
 */

import { useSelector, useDispatch } from 'react-redux';
import {
    getRvolData,
    getConfig,
} from './Actions';

export const useFilterState = () => {
    return {
        dashboard: useSelector(state => state.dashboard.toJS()),
    };
};

export const useFilterDispatch = () => {
    const dispatch = useDispatch();
    return {
        dispatch: dispatch,
        getRvolData: params => dispatch(getRvolData(params)),
        getConfig: () => dispatch(getConfig()),
    };
};
