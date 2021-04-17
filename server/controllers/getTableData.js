/**
 * Created by shashi.sh on 10/04/21.
 */

const database = require('../sqlConnection');

const realisedVolatilityModel = ({type, lastNData, token}) => {
    try {
        const collectionName = type + '-' + token;
        const query = 'select * from `' + collectionName + '`';

        return new Promise((resolve, reject) => {
            database.query(
                query,
                (err, result) => {
                    return err ? reject(err) : resolve({instrument_token: token, data: result.slice(-1 * lastNData)});
                }
            );
        });
    }
    catch (ex) {
        throw ex;
    }
};

const getRVolDataHelper = async (params) => {
    try {
        const results = [];

        params.products.forEach((token) => {
            resultMap[token] = [];
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
        throw ex;
    }
};

exports.getRvolData = getDataPrommise;