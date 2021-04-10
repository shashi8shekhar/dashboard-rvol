const cors = require('cors');
const express = require('express');
const mysql = require('mysql');

const axios = require('axios');
const cron = require('node-cron');

const app = express();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST_IP,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

app.use(cors());

const params = {
    access_key: 'cefba5a5bd1ad57b20267680c6ef8d99',
    symbols: 'arkk',
    date_from: '2021-03-25',
    date_to: '2021-04-04',
};

// var sqlQuery = "CREATE TABLE symbols ( " +
//     "name varchar(100) NOT NULL, " +
//     "tStart TIME NOT NULL, " +
//     "tEnd TIME NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1";

// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
    console.log('running a task every minute 2');



    var sqlQueryinsert = `INSERT INTO symbols(name, tStart, tEnd) VALUES ? `;

    var values = [
        ['aapl', '09:30:00', '16:00:00'],
        ['spy', '09:30:00', '16:00:00'],
        ['qqq', '09:30:00', '16:00:00'],
        ['iwm', '09:30:00', '16:00:00']
    ];

    // pool.query(sqlQueryinsert, [values],
    //     (err, results) => {
    //         if (err) {
    //             console.log("Table not Insert");
    //         } else {
    //             console.log('Row inserted:' + results.affectedRows);
    //         }
    //     });

    // pool.query(`select * from symbols`, (err, results) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log(results);
    //     }
    // });
});


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


app.listen(process.env.REACT_APP_SERVER_PORT, () => {
  console.log(`App server now listening on port ${process.env.REACT_APP_SERVER_PORT}`);
});

app.get('/test', (req, res) => {
  const { table } = req.query;

  pool.query(`select * from ${table}`, (err, results) => {
    if (err) {
      return res.send(err);
    } else {
      return res.send(results);
    }
  });
});