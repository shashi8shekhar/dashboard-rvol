/**
 * Created by shashi.sh on 10/04/21.
 */

const { createLogger, format, transports} = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.json(),
    transports: [
        new transports.Console({
            "level" : 'info'
        })
    ],
    defaultMeta : {
        "isAccessLog": false
    }
});

module.exports = logger;