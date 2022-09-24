import time
from datetime import timedelta

start_time = time.time()
import instrument_list
import updateWinddownTable
import updateRealisedVol
import implied_vol
import rVolScheduler
import implied_vol_scheduler
from estimation import estimate_vol
from nse_holidays import trading_day

import argparse
import kite


def execute(param):
    kite_obj = kite.Kite()
    check_con = kite_obj.is_connected()
    if not check_con:
        print('Inside not connected!!!')
        kite_obj.set_access_token()
        inst_list = instrument_list.InstrumentList()
        inst_list.runFullUpdate(kite_obj)

    if param == 'ALL':
        print(param, '  Running Wind down')
        # Update Winddown Table
        update_winddown_table_obj = updateWinddownTable.UpdateWinddownTable()
        update_winddown_table_obj.updateWinddown(kite_obj)

        print('Running Realised Volatility')
        # Update Realised Volatility Table
        update_realised_vol_obj = updateRealisedVol.UpdateRealisedVol()
        update_realised_vol_obj.runFullUpdate(kite_obj)

    elif param == 'WIND_DOWN':
        print(param, '  Running Wind down')
        # Update Winddown Table
        update_winddown_table_obj = updateWinddownTable.UpdateWinddownTable()
        update_winddown_table_obj.updateWinddown(kite_obj)

    elif param == 'RVOL':
        print(param, '  Running Realised Volatility')
        # Back Populate Realised Volatility Table
        update_realised_vol_obj = updateRealisedVol.UpdateRealisedVol()
        update_realised_vol_obj.runFullUpdate(kite_obj)

    elif param == 'IV':
        print(param, '  Running Implied Volatility')
        # Back Populate Implied Volatility Table
        iv = implied_vol.UpdateImpliedVol()
        iv.runFullUpdate(kite_obj)

    elif param == 'IL':
        print(param, '  Running Update Instruments')
        # Back Populate Instruments Table
        instruments = instrument_list.InstrumentList()
        instruments.runFullUpdate(kite_obj)

    elif param == 'EST':
        print(param, '  Running Vol. Estimates')
        # Run Estimate
        vol_curve_obj = estimate_vol.EstimateVolData()
        vol_curve = vol_curve_obj.runFullUpdate(kite_obj)

    else:
        is_trading_day = trading_day()
        print('Is Trading Day = ', is_trading_day)
        print(param, 'Running Scheduler')

        if is_trading_day:
            # Update Implied Volatility Table
            implied_vol_scheduler_obj = implied_vol_scheduler.ImpliedVolScheduler()
            implied_vol_scheduler_obj.runScheduler(kite_obj)

            # Update Realised Volatility Table
            realized_vol_scheduler_obj = rVolScheduler.RealTimePopulateRealisedVolData()
            realized_vol_scheduler_obj.runUpdate(kite_obj)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("a", nargs='?', default="SCHEDULER")
    args = parser.parse_args()
    print(args.a)
    execute(args.a)

    elapsed_time_secs = time.time() - start_time

    msg = "Execution took: %s secs (Wall clock time)" % timedelta(seconds=round(elapsed_time_secs))
    print("--- %s seconds ---" % (time.time() - start_time))
    print(msg)
