/**
 * Created by shashi.sh on 10/04/21.
 */

const pool = require('../sqlConnection');
const dayRvols = require('./../constants/config').dayRvols;
const  defaultProducts = require('./../constants/config').defaultProducts;
const moment = require('moment');
// const _ = require('lodash/core');


const realisedVolatilityModel = ({type, lastNData, token}) => {
    try {
        const collectionName = type + '-' + token;
        const query = 'select * from `' + collectionName + '`';
        // console.log('inside realisedVolatilityModel try', collectionName);

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

        let filterData = eachScript.data.filter(item => {

            const lastUpdatedDateObj = item['dateTime'];
            const newMomentObj = moment(moment(lastUpdatedDateObj).toISOString(), "YYYY-MM-DDTHH:mm:ss.SSSSZ", true).utc();
            const lastUpdatedTime =  moment(newMomentObj).format("HH:mm:ss");

            return t_end === lastUpdatedTime;
        });

        // filterData.splice(-1,1);
        filterData.reverse();

        let count = 0
        let rvolsq = 0;
        let dayData = {};

        filterData.forEach( (item, idx) => {
            rvolsq += Math.pow(item['today'], 2);

            if ( idx+1 === dayRvols[count] ) {
                let key = dayRvols[count] + 'day';
                dayData[key] = Math.sqrt(rvolsq / dayRvols[count]);
                count++;
            }
        });

        let len = eachScript.data.length;
        // eachScript.data[len - 1] = {...eachScript.data[len - 1], ...result};

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