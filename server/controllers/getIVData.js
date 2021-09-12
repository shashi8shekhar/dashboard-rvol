/**
 * Created by shashi.sh on 22/05/21.
 */

const pool = require('../sqlConnection');
const dayRvols = require('./../constants/config').dayRvols;
const  defaultProducts = require('./../constants/config').defaultProducts;
const moment = require('moment');
const _ = require('lodash');

const hadleSqlConnection = require('../utils').hadleSqlConnection;

const impliedVolatilityModel = ({type, lastNData, token, expiry}) => {
    try {
        const collectionName = type + '-' + expiry + '-' + token;
        const query = 'select * from `' + collectionName + '`';
        // console.log('inside impliedVolatilityModel try', collectionName);

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                hadleSqlConnection(err, connection); // not connected!
                connection.query(query, function (error, results, fields) {
                    connection.release();
                    return err ? reject(err) : resolve({instrument_token: token, expiry, data: results });
                });
            });
        });
    }
    catch (ex) {
        console.log('inside impliedVolatilityModel catch');
        throw ex;
    }
};

const updateDaysIvol = (data) => {
    // console.log('inside updateDaysIvol', data.length);
    let content = data.map(eachScript => {
        const instrument_token = eachScript['instrument_token'];

        const result = defaultProducts.find((instrument) => instrument['instrument_token'] === instrument_token);
        const t_start = result['t_start'];

        let count = 0;
        const dataLocal = _.filter((eachScript.data.reverse()).map(item => {
            const lastUpdatedDateObj = item['dateTime'];
            const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();
            const lastUpdatedTime =  moment(newMomentObj).format("HH:mm:ss");

            if(t_start === lastUpdatedTime && count < 2) {
                count++;
                return item;
            }
        }), obj => {return obj});

        return {instrument_token, data: dataLocal.reverse() };
    });
    return content;
};

const getIVolDataHelper = async (params) => {
    try {
        const results = [];
        // console.log('inside getIVolDataHelper', params);

        params.products.forEach((token) => {
            params.expiryDates.forEach(expiry => {
                results.push( impliedVolatilityModel( {...{token, expiry}, ...params} ) );
            });
        });
        // console.log('results', results);

        const contents = await Promise.all(results);
        // console.log('contents', contents[0].length);

        // const updateDaysIvol = updateDaysIvol(contents);
        //const updateDaysIvol = updateOtherTimeFrameRvol(contents);
        let data = {};
        contents.forEach(eachExpiry => {
            data[eachExpiry.instrument_token] = data[eachExpiry.instrument_token] || {};
            if (eachExpiry.data && eachExpiry.data.length) {

                eachExpiry.data = eachExpiry.data.slice(-120);

                eachExpiry.data.forEach(function(part, index) {
                    // let obj = new Object();
                    for (var key in part) {
                        if ( (!this[index][key] || key.endsWith('-delta') || key.endsWith('-gamma') || key.endsWith('-theta') || key.endsWith('-vega')) ) {
                            delete this[index][key];
                            // obj[key] = this[index][key]
                        }
                    }

                    // this[index] = obj;
                }, eachExpiry.data);

                const lastIndex = eachExpiry.data.length - 1;
                const atm_strike = eachExpiry['data'][lastIndex]['atm_strike'];

                eachExpiry['iv'] = eachExpiry['data'][lastIndex][atm_strike + '-iv'];
                eachExpiry['skew'] = eachExpiry['data'][lastIndex]['skew'];

                data[eachExpiry.instrument_token][eachExpiry.expiry] = eachExpiry;
                data[eachExpiry.instrument_token]['last_updated'] = eachExpiry.data[lastIndex]['dateTime'];
            }
        });

        let dataList = []
        params.products.forEach((token) => {
            dataList.push( {instrument_token: token, data: data[token]} );
        });


        return dataList;
    }
    catch (ex) {
        throw ex;
    }
};

const getDataPromise = (req, res) => {
    try {
        const { type, products, expiryDates } = req.body;
        const resultMap = {};
        const lastNData = 1;

        getIVolDataHelper({products, type, expiryDates, lastNData}).then(function (result) {
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