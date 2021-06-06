/**
 * Created by shashi.sh on 04/04/21.
 */

module.exports = {
    dayRvols: [
        1, 3, 5, 10, 30
    ],
    mainTableConfig : [
        // {
        //     key: 'rvol',
        //     label: 'RVOL',
        // },
        // {
        //     key: 'per',
        //     label: '%',
        // },
        // {
        //     key: 'perDay',
        //     label: '%DAY',
        // },
        {
            key: '5min',
            label: '5min',
        },
        {
            key: '10min',
            label: '10min',
        },
        {
            key: '30min',
            label: '30min',
        },
        {
            key: 'today',
            label: 'Gap',
        },
        {
            key: 'nogap',
            label: 'NoGap'
        },
        {
            key: '1day',
            label: '1 Day',
        },
        {
            key: '3day',
            label: '3 Day',
        },
        {
            key: '5day',
            label: '5 Day',
        },
        {
            key: '10day',
            label: '10 Day',
        },
        {
            key: '30day',
            label: '30 Day',
        }
    ],
    defaultProducts: [
        {
            "expiry":"",
            "id":2094085071,
            "instrument_token":256265,
            "last_price":0,
            "lot_size":0,
            "segment":"INDICES",
            "strike":0,
            "tradingsymbol":"NIFTY",
            "weight":0,
            "t_start":"09:15:00",
            "t_end":"15:29:00",
            "avg_hedge_per_day":15
        },
        {
            "expiry":"",
            "id":2094085178,
            "instrument_token":260105,
            "last_price":0,
            "lot_size":0,
            "segment":"INDICES",
            "strike":0,
            "tradingsymbol":"BANKNIFTY",
            "weight":1,
            "t_start":"09:15:00",
            "t_end":"15:29:00",
            "avg_hedge_per_day":15
        },
//        {
//            "expiry":"",
//            "id":2094085249,
//            "instrument_token":738561,
//            "last_price":0,
//            "lot_size":1,
//            "segment":"NSE",
//            "strike":0,
//            "tradingsymbol":"RELIANCE",
//            "weight":2,
//            "t_start":"09:15:00",
//            "t_end":"15:29:00",
//            "avg_hedge_per_day":15
//        },
//        {
//            "expiry":"",
//            "id":2094085280,
//            "instrument_token":340481,
//            "last_price":0,
//            "lot_size":1,
//            "segment":"NSE",
//            "strike":0,
//            "tradingsymbol":"HDFC",
//            "weight":3,
//            "t_start":"09:15:00",
//            "t_end":"15:29:00",
//            "avg_hedge_per_day":50
//        }
    ],
}