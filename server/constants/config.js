/**
 * Created by shashi.sh on 04/04/21.
 */

module.exports = {
    mainTableConfig : [
        {
            key: 'rvol',
            label: 'RVOL',
        },
        {
            key: 'per',
            label: '%',
        },
        {
            key: 'perDay',
            label: '%DAY',
        },
        {
            key: 'fiveMin',
            label: '5min',
        },
        {
            key: 'tenMin',
            label: '10min',
        },
        {
            key: 'thirtyMin',
            label: '30min',
        },
        {
            key: 'gap',
            label: 'Gap',
        },
        {
            key: 'noGap',
            label: 'NoGap',
        }
    ],
    defaultProducts: [
        {
            expiry: "",
            id: 2094085071,
            instrument_token: 256265,
            last_price: 0,
            lot_size: 0,
            segment: "INDICES",
            strike: 0,
            tradingsymbol: "NIFTY 50",
            weight: 0,
        },
        {
            expiry: "",
            id: 2094085178,
            instrument_token: 260105,
            last_price: 0,
            lot_size: 0,
            segment: "INDICES",
            strike: 0,
            tradingsymbol: "NIFTY BANK",
            weight: 1,
        },
        {
            expiry: "",
            id: 2094085249,
            instrument_token: 738561,
            last_price: 0,
            lot_size: 1,
            segment: "NSE",
            strike: 0,
            tradingsymbol: "RELIANCE",
            weight: 2,
        },
        {
            expiry: "",
            id: 2094085280,
            instrument_token: 340481,
            last_price: 0,
            lot_size: 1,
            segment: "NSE",
            strike: 0,
            tradingsymbol: "HDFC",
            weight: 3,
        },
        {
            expiry: "",
            id: 2094085370,
            instrument_token: 2953217,
            last_price: 0,
            lot_size: 1,
            segment: "NSE",
            strike: 0,
            tradingsymbol: "TCS",
            weight: 4,
        }
    ],
} 