/**
 * Created by shashi.sh on 11/04/21.
 */

const pool = require('../sqlConnection');
const  defaultProducts = require('./../constants/config').defaultProducts;
const hadleSqlConnection = require('../utils').hadleSqlConnection;

const createConfigTable = function () {
    var sqlCreateConfig = "CREATE TABLE if not exists config ("+
                            " expiry varchar(255),"+
                            " id int,"+
                            " instrument_token int NOT NULL primary key,"+
                            " last_price int,"+
                            " lot_size int,"+
                            " segment varchar(255),"+
                            " strike int,"+
                            " tradingsymbol varchar(255) NOT NULL,"+
                            " weight int,"+
                            " t_start time,"+
                            " t_end time,"+
                            " avg_hedge_per_day int,"+
                            " UNIQUE (id, instrument_token))";

    let createConfig = `create table if not exists config(
                          expiry varchar(255), 
                          id int,
                          instrument_token int NOT NULL primary key,
                          last_price int,
                          lot_size int,
                          segment varchar(255) ,
                          strike int,
                          tradingsymbol varchar(255) NOT NULL,
                          weight int,
                          t_start time,
                          t_end time,
                          avg_hedge_per_day int
                          UNIQUE (id, instrument_token)
                      )`;

    pool.getConnection(function(err, connection) {
        hadleSqlConnection(err, connection); // not connected!
        console.log("Connected!");
        connection.query(sqlCreateConfig, function(err, results, fields) {
            connection.release();
            if (err) {
                console.log('inside create', err.message);
            } else {
                console.log('config table created!')
                modifyConfig('insert')
            }
        });
    });
};

exports.checkTableExists = function (table) {
    pool.getConnection(function(err, connection) {
        hadleSqlConnection(err, connection); // not connected!
        console.log("Connected!");
        connection.query(`SHOW TABLES LIKE "${table}"`, (error, results) => {
            connection.release();
            if(results.length === 0) {
                createConfigTable(table);
            } else if(error) {
                console.log('not exist ', table);
                modifyConfig('insert')
            } else {
                console.log('exist ', table);
                modifyConfig('insert')
            }
        });
    });
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
            var sql = "INSERT IGNORE INTO config (" + columnsList.join(",") +") VALUES ?";
            pool.getConnection(function(err, connection) {
                hadleSqlConnection(err, connection); // not connected!
                connection.query(sql, [valuesList], function(err, result) {
                    connection.release();
                    if(err) throw err;
                });
            });
        } else {
            var sql = "UPDATE config SET '" + columns.join("' = ? ,'") +"' = ?";

            pool.getConnection(function(err, connection) {
                hadleSqlConnection(err, connection); // not connected!
                connection.query(sql, valuesList, (error, result, fields) => {
                    connection.release();
                    if(err) throw err;
                    console.log('config updated');
                });
            });
        }
    }
    catch (ex) {
        console.log('config DB update error', ex);
    }
};