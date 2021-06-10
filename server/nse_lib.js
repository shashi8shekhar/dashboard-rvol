/**
 * Created by shashi.sh on 03/05/21.
 */

const {
    exec,
    spawn
} = require('child_process');

function execute(command, callback) {
    // console.log('command: ', command)
    exec(command, {
        maxBuffer: 1024 * 1000 * 10
    }, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);

        if(error !== null)
        {
            // console.log('exec error: ' + error);
        }
        callback(stdout);
    });
};

function isJson(text) {
    try {
        return JSON.parse(text);
    } catch (err) {
        return false;
    }
}

function getOptionChain(instrument, type) {
    // console.log(instrument, type);
    // console.log(`https://www.nseindia.com/api/option-chain-${type}?symbol=${instrument}`);
    return new Promise((resolve, reject) => {
        execute(`curl 'https://www.nseindia.com/api/option-chain-${type}?symbol=${instrument}' \
        -H 'authority: www.nseindia.com' \
        -H 'cache-control: max-age=0' \
        -H 'dnt: 1' \
        -H 'upgrade-insecure-requests: 1' \
        -H 'user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1' \
        -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
        -H 'sec-fetch-site: none' \
        -H 'sec-fetch-mode: navigate' \
        -H 'sec-fetch-user: ?1' \
        -H 'sec-fetch-dest: document' \
        -H 'accept-encoding: gzip, deflate, br' \
        -H 'accept-language: en-IN,en;q=0.9,en-GB;q=0.8,en-US;q=0.7,hi;q=0.6,mr;q=0.5' \
        --compressed`, function (resp) {
                // console.log('resp ====', resp);
                let isValidData = isJson(resp);
                if (isValidData) {
                    resolve(isValidData);
                } else {
                    resolve();
                }
            });

    });
}

module.exports = getOptionChain;


//`curl 'https://www.nseindia.com/api/option-chain-${type}?symbol=${instrument}' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0' -H 'Accept: */*' -H 'Accept-Language: en-US,en;q=0.5' --compressed -H 'DNT: 1' -H 'Connection: keep-alive' -H 'Referer: https://www.nseindia.com/option-chain' -H 'Cookie: nsit=Gre4JMp0qEWcd8mb8tc7pugc; nseappid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhcGkubnNlIiwiYXVkIjoiYXBpLm5zZSIsImlhdCI6MTYyMDA1MTcwNCwiZXhwIjoxNjIwMDU1MzA0fQ.Xh0sb-Ia7wkgetgoCz2-gv5wT42p0XG-7ke-zy7yYvc; AKA_A2=A; ak_bmsc=E91E07AA128E3801BA305812EA5FE49117D38759E3450000F8069060B8C26C71~plL0foaBAwpdtKR2PR7j23GvlNBjVQ5hbZLXC4R9Y1moMZYPimOVZRg4pc9E8u8OxoyE1Gd0xoP/q3LkHr4J7ziChMdOGdCCtXNwmqZw2ICHUflRMpPh27u3OAURh5D96GfFUVgXsllELE8odDxN/o1KPvcHKGAf5if7poP4X01I6E2vWuYuhhFAvwlRkD92Hc/ofT9+Hc8elgDbPecZ9vYNaFCgVKcoogqp4ZUY88Tq2tLp4G9H7ORheWXuT8aIma; bm_sv=C6D8B8D2085A19306C971F87408E2293~DtTRwGyLmKOIZKiBmtcDNk0r7XSLBFHJOArpQuGOQ25jUzFM3c9AGtSo5vGQhKrV6RJOotsiINWfWAtL7EGtYvvSqY8JQNQlZqTznv3eQ6u5I8AJxf1xd1FMKHIjBy9DEs9tUnJlgE8P7TW3+Xig/zeRpIDkSqm2pEGcAMahD4g=' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H 'TE: Trailers'`