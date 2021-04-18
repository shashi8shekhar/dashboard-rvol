/**
 * Created by shashi.sh on 10/04/21.
 */

const pool = require('../sqlConnection');

const realisedVolatilityModel = ({type, lastNData, token}) => {
    try {
        const collectionName = type + '-' + token;
        const query = 'select * from `' + collectionName + '`';
        console.log('inside realisedVolatilityModel try', collectionName);

        return new Promise((resolve, reject) => {
            pool.getConnection(function(err, connection) {
                if (err) throw err; // not connected!
                connection.query(query, function (error, results, fields) {
                    connection.release();
                    return err ? reject(err) : resolve({instrument_token: token, data: results.slice(-1 * lastNData)});
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
        console.log('inside getRVolDataHelper', params);

        params.products.forEach((token) => {
            results.push( realisedVolatilityModel( {...{token}, ...params} ) );
        });
        console.log('results', results);

        const contents = await Promise.all(results);

        console.log('contents', contents);
        return contents;
    }
    catch (ex) {
        throw ex;
    }
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