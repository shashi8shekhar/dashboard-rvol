/**
 * Created by shashi.sh on 10/04/21.
 */

const logger = require('../logger');

const  mainTableConfig = require('./../constants/config').mainTableConfig;
const  defaultProducts = require('./../constants/config').defaultProducts;


exports.getPageConfig = function (req, res) {
    try {

        const result = {mainTableConfig: mainTableConfig, defaultProducts: defaultProducts};

        res.status(200);
        res.send(result);
    }
    catch (ex) {
        logger.error(JSON.stringify({err_name: "GET_CONFIG_FAILURE", err_stk: ex.stack}));
        res.status(500);
        res.send(ex);
    }
};