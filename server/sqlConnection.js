/**
 * Created by shashi.sh on 11/04/21.
 */

const mysql = require('mysql');

const pool  = mysql.createPool({
    connectionLimit : 50,
    host: process.env.MYSQL_HOST_IP,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

module.exports = pool;