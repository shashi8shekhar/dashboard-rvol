/**
 * Created by shashi.sh on 08/05/21.
 */

const pool = require('../sqlConnection');
const dayRvols = require('./../constants/config').dayRvols;
const  defaultProducts = require('./../constants/config').defaultProducts;
const moment = require('moment');
const _ = require('lodash');

const hadleSqlConnection = require('../utils').hadleSqlConnection;


const realisedVolatilityModel = ({type, lastNData, token}) => {
    try {
        const collectionName = type + '-' + token;
        const query = 'select * from `' + collectionName + '`';
        // console.log('inside realisedVolatilityModel try', collectionName);

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                hadleSqlConnection(err, connection); // not connected!
                connection.query(query, function (error, results, fields) {
                    connection.release();
                    return err ? reject(err) : resolve({instrument_token: token, data: results });
                });
            });
        });
    }
    catch (ex) {
        console.log('inside realisedVolatilityModel catch');
        throw ex;
    }
};

const getRVolDataHelper = async (params) => {
    try {
        const results = [];
        //console.log('inside getRVolDataHelper', params);

        params.products.forEach((token) => {
            results.push( realisedVolatilityModel( {...{token}, ...params} ) );
        });
        // console.log('results', results);

        const contents = await Promise.all(results);

        const updatedDaysRvol = updateDaysRvol(contents);
        //console.log('contents', contents[0]['data'][0]);
        //const updatedRvol = updateOtherTimeFrameRvol(contents);
        return updatedDaysRvol;
    }
    catch (ex) {
        throw ex;
    }
};

const updateDaysRvol = (data) => {
    let content = data.map(eachScript => {
        const instrument_token =  eachScript['instrument_token'];

        const result = defaultProducts.find( (instrument) => instrument['instrument_token'] === instrument_token );
        const t_end = result['t_end'];
        const t_start = result['t_start'];

        let dayData = {};

        const scriptData = JSON.parse(JSON.stringify(eachScript.data));

        let filterData = scriptData.filter((item, idx) => {
            const lastUpdatedDateObj = item['dateTime'];
            const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();
            const lastUpdatedTime =  moment(newMomentObj).format("HH:mm:ss");

            if(idx+1 === eachScript.data.length) {
                return true;
            }

            return t_end === lastUpdatedTime;
        });

        //Get today Time Series data
        const toDayMap = {
            key: 'today',
            data: filterData.slice(Math.max(filterData.length - 15, 0)),
        };

        //Get 30day Time Series data
        let rvolsq = [];
        let time = 30;
        filterData.forEach( (item, idx) => {
            rvolsq.push( Math.pow(item['today'], 2) );

            // console.log('outside if', item,);
            // console.log('idx', idx, count);

            if ( idx+1 >= 3 ) {
                let key = '30day';
                let threeDaySum = 0,
                    fiveDaySum = 0,
                    tenDaySum = 0,
                    thirtyDaySum = 0;

                for(let i = rvolsq.length -1; i >= 0; i-- ) {
                    threeDaySum = (rvolsq.length - i <= 3) ? threeDaySum + rvolsq[i] : threeDaySum;
                    fiveDaySum = (rvolsq.length - i <= 5) ? fiveDaySum + rvolsq[i] : fiveDaySum;
                    tenDaySum = (rvolsq.length - i <= 10) ? tenDaySum + rvolsq[i] : tenDaySum;
                    thirtyDaySum = (rvolsq.length - i <= 30) ? thirtyDaySum + rvolsq[i] : thirtyDaySum;
                }
                filterData[idx]['3day'] = Math.sqrt(threeDaySum / 3);
                filterData[idx]['5day'] = Math.sqrt(fiveDaySum / 5);
                filterData[idx]['10day'] = Math.sqrt(tenDaySum / 10);
                filterData[idx]['30day'] = Math.sqrt(thirtyDaySum / 30);

                // console.log('inside if', key, dayData[key]);
                // console.log(idx, count, dayRvols[count]);
            }
        });

        const threeDayMap = {
            key: '3day',
            data: filterData.slice(Math.max(filterData.length - 30, 0)),
        };

        const fiveDayMap = {
            key: '5day',
            data: filterData.slice(Math.max(filterData.length - 30, 0)),
        };

        const tenDayMap = {
            key: '10day',
            data: filterData.slice(Math.max(filterData.length - 30, 0)),
        };

        const thirtyDayMap = {
            key: '30day',
            data: filterData.slice(Math.max(filterData.length - 30, 0)),
        };

        //Get 30 Minute Time Series data
        const filterDataThirtyMin = _.uniqBy(scriptData, '30min');
        const thirtyMinMap = {
            key: '30min',
            data: filterDataThirtyMin.slice(Math.max(filterDataThirtyMin.length - 30, 0)),
        };

        //Get 10 Minute Time Series data
        const filterDataTenMin = _.uniqBy(scriptData, '10min');
        const tenMinMap = {
            key: '10min',
            data: filterDataTenMin.slice(Math.max(filterDataTenMin.length - 40, 0)),
        };

        let dataTimeSeries = [];

        dataTimeSeries.push(thirtyMinMap);
        dataTimeSeries.push(tenMinMap);
        dataTimeSeries.push(toDayMap);
        dataTimeSeries.push(threeDayMap);
        dataTimeSeries.push(fiveDayMap);
        dataTimeSeries.push(tenDayMap);
        dataTimeSeries.push(thirtyDayMap);

        return { instrument_token, data: dataTimeSeries };
    });

    return content;
};

const getDataPromise = (req, res) => {
    try {
        const { type, products } = req.body;
        const resultMap = {};
        const lastNData = 1;

        getRVolDataHelper({products, type, lastNData}).then(function (result) {
            // close all connections
            // pool.end();
            res.status(200);
            res.send(result);
        }, function (err) {
            // close all connections
            // pool.end();
            res.status(500);
            res.send({
                err: 'Document not found'
            });
        });
    }
    catch (ex) {
        throw ex;
    }
};

exports.getTimeSeriesData = getDataPromise;
