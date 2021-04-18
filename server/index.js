const cors = require('cors');
const express = require('express');
const logger = require("./logger");
const pool = require('./sqlConnection');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Response Headers: Crossdomain and credentials
const getResponseHeaders = function (params) {
    return {
        "Access-Control-Allow-Origin": params.origin,
        "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Max-Age": '86400',
        "Access-Control-Allow-Headers": "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, content-disposition",
        "Access-Control-Expose-Headers": "Content-Disposition"
    };
};

const addResponseHeaders = function(req, res, next) {
    const responseHeaders = getResponseHeaders({origin: req.headers.origin});
    Object.keys(responseHeaders).forEach(function(key) {
        res.header(key, responseHeaders[key]);
    });
    next();
}


// Instantiating express app
const app = express();
app.use(cors());

app.use(addResponseHeaders);

app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


const router = require('./routes/data')
const getConfig = require('./controllers/getConfig');
const getTableData = require('./controllers/getTableData');
const checkTableExists = require('./controllers/updateConfigurations').checkTableExists;

app.get('/loadConfig', (req, res) => {
    getConfig.getPageConfig(req, res);
});

app.post('/loadRvolData', function (req, res) {
    getTableData.getRvolData(req, res);
});

app.use(function (err, req, res, next) {
    const errorObj = {};
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