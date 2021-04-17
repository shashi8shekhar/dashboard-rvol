server > index.js

// const cron = require('node-cron');
//const axios = require('axios');

// Schedule tasks to be run on the server.
// cron.schedule('* * * * *', function() {
//     console.log('running a task every minute 2');
// });


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

