/**
 * Created by shashi.sh on 04/04/21.
 */

export default const min_winddown = 0.01; //used for 1st window where difference is close to zero.
export default const avg_hedge_per_day = 130;
export default const n_iterations = 1000;
export default const sliding_window = 10; // n minutes sliding window
export default const min_rolling_periods = sliding_window; //#(0, sliding_window]
export default const Tstart = '09:16'; //market start time
export default const Tend = '15:30'; //market close time

export default const mainTableConfig = [
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
];

export default const defaultProducts = [
    {
        name: 'RELIANCE',
        instrument_token: '738561',
        tStart: '09:16:00',
        tEnd: '15:30:00',
    }
];