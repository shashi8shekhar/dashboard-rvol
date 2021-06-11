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
            data: filterData.slice(Math.max(filterData.length - 10, 0)),
        };

        //Get 30 Minute Time Series data
        const filterDataThirtyMin = _.uniqBy(scriptData, '30min');
        const thirtyMinMap = {
            key: '30min',
            data: filterDataThirtyMin.slice(Math.max(filterDataThirtyMin.length - 10, 0)),
        };

        //Get 10 Minute Time Series data
        const filterDataTenMin = _.uniqBy(scriptData, '10min');
        const tenMinMap = {
            key: '10min',
            data: filterDataTenMin.slice(Math.max(filterDataTenMin.length - 10, 0)),
        };


        let dataTimeSeries = [];

        dataTimeSeries.push(thirtyMinMap);
        dataTimeSeries.push(tenMinMap);
        dataTimeSeries.push(toDayMap);

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