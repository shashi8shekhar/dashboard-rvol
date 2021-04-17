/**
 * Created by shashi.sh on 17/04/21.
 */

import { Map, List, fromJS } from 'immutable';
import {
    LOAD_RVOL_DATA,
    LOAD_RVOL_DATA_FAIL,
    LOAD_RVOL_DATA_SUCCESS,
    LOAD_CONFIG_DATA,
    LOAD_CONFIG_DATA_FAIL,
    LOAD_CONFIG_DATA_SUCCESS,
} from './ActionTypes';

var moment = require('moment');

const initialState = Map({
    rVolData: {
        loading: true,
        data: Map({}),
        error: '',
    },
    config: {
        loading: true,
        data: Map({}),
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

                state.setIn(['config', 'data'], fromJS(result));
                state.setIn(['config', 'loading'], false);
                state.setIn(['config', 'error'], error);
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
                const error = fromJS(action.result.result) ? '' : 'Oops, Something went wrong!';
                const { result } = action.result;

                state.setIn(['rVolData', 'data'], fromJS(result));
                state.setIn(['rVolData', 'loading'], false);
                state.setIn(['rVolData', 'error'], error);
            });

        default:
            return state;
    }
}
