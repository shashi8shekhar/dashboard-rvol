/**
 * Created by shashi.sh on 10/04/21.
 */

const logger = require('../logger');
const _ = require('lodash');


const  mainTableConfig = require('./../constants/config').mainTableConfig;
const  defaultProducts = require('./../constants/config').defaultProducts;

const pool = require('../sqlConnection');
const moment = require('moment');

const instrumentsModel = ({type, token}) => {
    try {
        const collectionName = type + '-' + token;
        const query = 'select distinct expiry from `' + collectionName + '`';
        // console.log('inside instrumentsModel  try', collectionName);

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
        console.log('inside instrumentsModel catch');
        throw ex;
    }
};

const getExpiryListHelper = async (params) => {
    try {
        // console.log('inside getExpiryListHelper ', params);

        const results = instrumentsModel( params );

        const contents = await Promise.all([results]);
        // console.log('contents', contents);

        return contents[0]['data'].map(item => { return item.expiry; });
    }
    catch (ex) {
        throw ex;
    }
};

exports.getPageConfig = function (req, res) {
    try {

        const result = {mainTableConfig: mainTableConfig, defaultProducts: defaultProducts};
        const niftyObj = defaultProducts.find(item => { return item['tradingsymbol'] === 'NIFTY' });
        const niftyToken = niftyObj['instrument_token'];

        getExpiryListHelper({token: niftyToken, type: 'instruments'}).then(function (data) {
            result['expiryDates'] = data;
            res.status(200);
            res.send(result);
        }, function (err) {
            res.status(500);
            res.send({
                err: 'Document not found'
            });
        });
    }
    catch (ex) {
        logger.error(JSON.stringify({err_name: "GET_CONFIG_FAILURE", err_stk: ex.stack}));
        res.status(500);
        res.send(ex);
    }
};