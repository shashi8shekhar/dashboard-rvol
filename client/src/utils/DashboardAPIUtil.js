/**
 * Created by shashi.sh on 17/04/21.
 */

import * as APICallerUtil from './APICallerUtil';

const env = process.env.NODE_ENV;
const domain = window.location.origin;

let apiUrl = domain + '/';
let nseApi = 'https://www.nseindia.com/api/option-chain-'

export function getConfig() {
  return APICallerUtil.makeCall({
    apiType: 'get',
    urlPath: apiUrl + 'loadConfig'
  });
}

export function getRvolData(payload) {
  return APICallerUtil.makeCall({
    apiType: 'post',
    urlPath: apiUrl + 'loadRvolData',
    body: payload,
  });
}

export function getOptionChainNse(params) {
  return APICallerUtil.makeCall({
    apiType: 'post',
    urlPath: apiUrl + 'getNseOptionChain',
    body: params.body,
  });
}

export function getTimeSeriesData(params) {
  return APICallerUtil.makeCall({
    apiType: 'post',
    urlPath: apiUrl + 'loadTimeSeriesData',
    body: params,
  });
}