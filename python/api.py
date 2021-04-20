import updateWinddownTable
import updateRealisedVol
import rVolScheduler

import argparse

def execute(param):

    if(param == 'ALL'):
        print(param, '  Running Wind down')
        # Update Winddown Table
        updateWinddownTableObj = updateWinddownTable.UpdateWinddownTable()
        updateWinddownTableObj.updateWinddown()

        print('Running Realised Volatility')
        # Update Realised Volatility Table
        updateRealisedVolObj = updateRealisedVol.UpdateRealisedVol()
        updateRealisedVolObj.runFullUpdate()

    elif(param == 'WIND_DOWN'):
        print(param, '  Running Wind down')
        #Update Winddown Table
        updateWinddownTableObj = updateWinddownTable.UpdateWinddownTable()
        updateWinddownTableObj.updateWinddown()

    elif(param == 'RVOL_POPULATE'):
        print(param, '  Running Realised Volatility')
        #Back Populate Realised Volatility Table
        updateRealisedVolObj = updateRealisedVol.UpdateRealisedVol()
        updateRealisedVolObj.runFullUpdate()

    else:
        print(param, '  Running Scheduler')
        #Update Realised Volatility Table
        rVolSchedulerObj = rVolScheduler.RealTimePopulateRealisedVolData()
        rVolSchedulerObj.runUpdate()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("a", nargs='?', default="SCHEDULER")
    args = parser.parse_args()
    print(args.a)
    execute(args.a)