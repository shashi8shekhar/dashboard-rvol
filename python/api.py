import instrument_list
import updateWinddownTable
import updateRealisedVol
import implied_vol
import rVolScheduler

import argparse
import kite

def execute(param):
    kiteObj = kite.Kite()
    kiteObj.set_access_token()

    if(param == 'ALL'):
        print(param, '  Running Wind down')
        # Update Winddown Table
        updateWinddownTableObj = updateWinddownTable.UpdateWinddownTable()
        updateWinddownTableObj.updateWinddown(kiteObj)

        print('Running Realised Volatility')
        # Update Realised Volatility Table
        updateRealisedVolObj = updateRealisedVol.UpdateRealisedVol()
        updateRealisedVolObj.runFullUpdate(kiteObj)

    elif(param == 'WIND_DOWN'):
        print(param, '  Running Wind down')
        #Update Winddown Table
        updateWinddownTableObj = updateWinddownTable.UpdateWinddownTable()
        updateWinddownTableObj.updateWinddown(kiteObj)

    elif(param == 'RVOL_POPULATE'):
        print(param, '  Running Realised Volatility')
        #Back Populate Realised Volatility Table
        updateRealisedVolObj = updateRealisedVol.UpdateRealisedVol()
        updateRealisedVolObj.runFullUpdate(kiteObj)

    elif (param == 'IV'):
        print(param, '  Running Implied Volatility')
        # Back Populate Implied Volatility Table
        iv = implied_vol.UpdateImpliedVol()
        iv.runFullUpdate(kiteObj)

    elif (param == 'IL'):
        print(param, '  Running Update Instruments')
        # Back Populate Instruments Table
        instruments = instrument_list.InstrumentList()
        instruments.runFullUpdate(kiteObj)

    else:
        print(param, '  Running Scheduler')
        #Update Realised Volatility Table
        rVolSchedulerObj = rVolScheduler.RealTimePopulateRealisedVolData()
        rVolSchedulerObj.runUpdate(kiteObj)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("a", nargs='?', default="SCHEDULER")
    args = parser.parse_args()
    print(args.a)
    execute(args.a)
