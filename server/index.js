const cors = require('cors');
const express = require('express');
const logger = require("./logger");
const database = require('./sqlConnection');

const axios = require('axios');
const cron = require('node-cron');

// Instantiating express app
const app = express();
app.use(cors());

const router = require('./routes/data')
const getConfig = require('./controllers/getConfig');
const getTableData = require('./controllers/getTableData');
const checkTableExists = require('./controllers/updateConfigurations').checkTableExists;

// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
    console.log('running a task every minute 2');
});

const params = {
    access_key: 'cefba5a5bd1ad57b20267680c6ef8d99',
    symbols: 'arkk',
    date_from: '2021-04-01',
    date_to: '2021-04-04',
};
axios.get('http://api.marketstack.com/v1/eod', {params})
    .then(response => {
        const apiResponse = response.data;
        // console.log('apiResponse: ', apiResponse);

        if (Array.isArray(apiResponse['data'])) {
            apiResponse['data'].forEach(stockData => {
                console.log(`Ticker ${stockData['symbol']}`,
                    `has a day high of ${stockData['high']}`,
                  `on ${stockData['date']}`);
        });
    }
  }).catch(error => {
    console.log(error);
  });

app.get('/test', (req, res) => {
  const { table } = req.query;
    console.log('inside /test', table);

  database.query(`select * from ${table}`, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(results);
    }
  });
});

app.get('/loadConfig', (req, res) => {
    getConfig.getPageConfig(req, res);
});

app.post('/loadRvolData', function (req, res) {
    const { products } = req.query;
    logger.info("/loadRvolData being called ", products);

    const params = {
        products: products || [],
    };

    const query = getTableData.getQuery(params);

    getTableData.getRvolData(query, req, res);
});

app.use(function (err, req, res, next) {
    var errorObj = {};
    errorObj.err_name = "APP_FAILURE";
    errorObj.err_stk = err.stack;
    logger.error(JSON.stringify(errorObj));
    res.end("Internal Server Error");
});


app.listen(process.env.REACT_APP_SERVER_PORT, () => {
    checkTableExists('config');
    console.log(`App server now listening on port ${process.env.REACT_APP_SERVER_PORT}`);
});

module.exports = app;