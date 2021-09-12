/**
 * Created by shashi.sh on 11/04/21.
 */

// const mysql = require('mysql');
const mysql2 = require('mysql2');

const pool = mysql2.createPool({
    connectTimeout  : 60 * 60 * 1000,
    host            : process.env.MYSQL_HOST_IP,
    user            : process.env.MYSQL_USER,
    password        : process.env.MYSQL_PASSWORD,
    database        : process.env.MYSQL_DATABASE,
    waitForConnections: true,
});

module.exports = pool;