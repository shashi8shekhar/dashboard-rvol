/**
 * Created by shashi.sh on 10/04/21.
 */

const pool = require('../sqlConnection');
const dayRvols = require('./../constants/config').dayRvols;
const  defaultProducts = require('./../constants/config').defaultProducts;
const moment = require('moment');
// const _ = require('lodash/core');

const hadleSqlConnection = require('../utils').hadleSqlConnection.hadleSqlConnection;


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

        let filterData = eachScript.data.filter(item => {
            const lastUpdatedDateObj = item['dateTime'];
            const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();
            const lastUpdatedTime =  moment(newMomentObj).format("HH:mm:ss");

            // console.log(t_end, lastUpdatedTime);
            return t_end === lastUpdatedTime;
        });

        // filterData.splice(-1,1);
        filterData.reverse();

        // console.log(t_end, filterData);

        let count = 0
        let rvolsq = 0;

        filterData.forEach( (item, idx) => {
            rvolsq += Math.pow(item['today'], 2);

            // console.log('outside if', item,);
            // console.log('idx', idx, count);

            if ( idx+1 === dayRvols[count] ) {
                let key = dayRvols[count] + 'day';
                dayData[key] = Math.sqrt(rvolsq / dayRvols[count]);

                // console.log('inside if', key, dayData[key]);
                // console.log(idx, count, dayRvols[count]);

                count++;
            }
        });

        const len = eachScript.data.length;

        //Calculate Realized vol without gap
        let rvol_sq_day_nogap = 0;
        let wind_down_sum_day_nogap = 0;

        for(let i = len-1; i >= 0; i--) {
            const item = Object.assign({}, eachScript.data[i]);
            const lastUpdatedDateObj = item['dateTime'];
            const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();
            const lastUpdatedTime =  moment(newMomentObj).format("HH:mm:ss");

            if(lastUpdatedTime === t_start) {
                return { instrument_token, data: [{...eachScript.data[len - 1], ...dayData}] };
            } else {
                rvol_sq_day_nogap += Math.pow( parseFloat(item['5min']), 2) * parseFloat(item['winddown_5min']);
                wind_down_sum_day_nogap += parseFloat(item['winddown_5min']);

                dayData['nogap'] = Math.sqrt(rvol_sq_day_nogap / wind_down_sum_day_nogap);

                //console.log(instrument_token, lastUpdatedTime, '5m Rvol', item['5min'], '5m wd', item['winddown_5min'], 'ng Drv sq', rvol_sq_day_nogap, 'ngDwd +', wind_down_sum_day_nogap, 'ngRV', dayData['nogap'], 'gapRV', item['today'] );
            }
        }

        //console.log(eachScript.data[len - 1], dayData);
        return { instrument_token, data: [{...eachScript.data[len - 1], ...dayData}] };
    });

    return content;
};

const getDataPrommise = (req, res) => {
    try {
        const { type, products } = req.body;
        const resultMap = {}
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

exports.getRvolData = getDataPrommise;