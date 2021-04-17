/**
 * Created by shashi.sh on 10/04/21.
 */

const database = require('../sqlConnection');

const logger = require('../logger');

exports.getQuery = function (param) {
    try {
        const result = param;
        return result;
    }
    catch (ex) {
        logger.error(JSON.stringify({err_name: "error", err_stk: ex.stack}));
    }
};

exports.getRvolData = function (param, req, res) {
    try {
        database.query(`select * from ${table}`, (err, results) => {
            if (err) {
                return res.send(err);
            } else {
                return res.send(results);
            }
        });

        const result = param;
        res.status(200);
        res.send('success');
    }
    catch (ex) {
        logger.error(JSON.stringify({err_name: "error", err_stk: ex.stack}));
        res.status(500);
        res.send(ex);
    }
};