/**
 * Created by shashi.sh on 17/04/21.
 */

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import promiseMiddleware from 'middleware/promiseMiddleware';
import thunk from 'redux-thunk';
import * as reducers from 'reducers';

const rootReducer = combineReducers(reducers);
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default function configureStore(initialState) {
    return createStore(rootReducer, initialState, composeEnhancers(applyMiddleware(thunk, promiseMiddleware)));
}
