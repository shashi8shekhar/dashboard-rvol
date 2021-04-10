/**
 * Created by shashi.sh on 10/04/21.
 */

const getConfig = require('../controllers/getConfig');
const getTableData = require('../controllers/getTableData');
const logger = require('../logger');
const express = require('express');
const router = express.Router();

module.exports = function (passport) {
    router.get('/', function (req, res, next) {
        res.send("Dashboard Config API up and running ...");
    });
    router.get('/loadConfig', function (req, res) {
        logger.info("/loadConfig being called " );
        console.log('inside loadconfig')
        res.status(200);
        res.send('SUCCESS')
        // getConfig.getPageConfig(req, res);
    });
    router.get('/loadRvolData', function (req, res) {
        try {
            const products = req.body.products;
            logger.info("/loadRvolData being called ", products);

            const params = {
                products: req.body.products || [],
            };

            const query = getTableData.getQuery(params);

            getTableData.getRvolData({query: query}).then(function (data) {
                res.status(200);
                res.send(data);
            }, function (err) {
                res.status(500);
                logger.error(err);
                res.send(err);
            });
        } catch (ex) {
            logger.error({err_name: "LOAD RVOLDATA ERROR", err_stk: ex.stack});
            res.status(200);
            res.send({
                result: [],
                retry_status: true
            });
        }
    });

    return router;
};

