/**
 * Created by shashi.sh on 22/05/21.
 */

const pool = require('../sqlConnection');
const dayRvols = require('./../constants/config').dayRvols;
const  defaultProducts = require('./../constants/config').defaultProducts;
const moment = require('moment');
const _ = require('lodash');


const impliedVolatilityModel = ({type, lastNData, token}) => {
    try {
        const collectionName = type + '-' + token;
        const query = 'select * from `' + collectionName + '`';
        console.log('inside impliedVolatilityModel try', collectionName);

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) throw err; // not connected!
                connection.query(query, function (error, results, fields) {
                    connection.release();
                    return err ? reject(err) : resolve({instrument_token: token, data: results });
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
        console.log('inside getIVolDataHelper', params);

        params.products.forEach((token) => {
            results.push( impliedVolatilityModel( {...{token}, ...params} ) );
        });
        console.log('results', results);

        const contents = await Promise.all(results);
        console.log('contents', contents[0]['data'].length);

        // const updateDaysIvol = updateDaysIvol(contents);
        //const updateDaysIvol = updateOtherTimeFrameRvol(contents);
        return contents;
    }
    catch (ex) {
        throw ex;
    }
};

const getDataPromise = (req, res) => {
    try {
        const { type, products } = req.body;
        const resultMap = {};
        const lastNData = 1;

        getIVolDataHelper({products, type, lastNData}).then(function (result) {
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