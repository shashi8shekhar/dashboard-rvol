/**
 * Created by shashi.sh on 11/04/21.
 */

const database = require('../sqlConnection');
const  defaultProducts = require('./../constants/config').defaultProducts;

const createConfigTable = function () {
    let createConfig = `create table if not exists config(
                          expiry varchar(255), 
                          id int,
                          instrument_token int primary key,
                          last_price int,
                          lot_size int,
                          segment varchar(255) ,
                          strike int,
                          tradingsymbol varchar(255) ,
                          weight int,
                          t_start time,
                          t_end time,
                          avg_hedge_per_day int
                      )`;

    database.query(createConfig, function(err, results, fields) {
        if (err) {
            console.log('inside create', err.message);
        }
    });
};

exports.checkTableExists = function (table) {
    let query = database.query(`SHOW TABLES LIKE "${table}"`, (error, results) => {
        if(error) {
            console.log('not exist ', table);
            modifyConfig('insert')
        } else {
            console.log('exist ', table);
        }
    });
    return query;
};

const modifyConfig = function (param) {
    try {
        let columnsList = [];
        let valuesList = [];

        defaultProducts.forEach(object => {
            columnsList = Object.keys(object);
            const values = Object.values(object);
            valuesList.push(values);
        });

        if (param === 'insert') {
            var sql = "INSERT INTO config (" + columnsList.join(",") +") VALUES ?";
            var query = database.query(sql, [valuesList], function(err, result) {
                if(err) throw err;
            });
        } else {
            var sql = "UPDATE config SET '" + columns.join("' = ? ,'") +"' = ?";

            database.query(sql, valuesList, (error, result, fields) => {
                if(err) throw err;
                console.log('config updated');
            });
        }
    }
    catch (ex) {
        console.log('config DB update error', ex);
    }
};