from dataPipeline.login.kite import kite
from sql.engine import engine
from sql.configDetails import configurationObj
from sql.winddownDetails import windDownDataObj
from sql.rVolDetails import rVolDataObj
from RealisedVol import RealisedVol
import constants
import pandas as pd
import datetime
from functools import reduce

nan_value = 0

class PopulateRealisedVolData:
    def __init__(self, config, winddown, start_date, end_date):
        self.winddown = winddown
        self.config = config
        self.iterations = constants.iterations
        self.start_date = start_date
        self.end_date = end_date

    def get_historical_data(self, instrument_token, from_date, to_date, interval):
        print(instrument_token, from_date, to_date, interval)
        return kite.historical_data(instrument_token, from_date, to_date, interval)

    def rvolBackPopulate(self, window):
        print(self.config['tradingsymbol'])
        records = self.get_historical_data(self.config['instrument_token'], self.start_date, self.end_date, constants.interval_rvol)
        records_df = pd.DataFrame(records)

        if ( len(records_df.index) == 0 ):
            return

        rVolObj = RealisedVol(records_df, self.config['t_start'].strftime("%H:%M:%S"), self.config['t_end'].strftime("%H:%M:%S"), window, self.config['avg_hedge_per_day'], constants.iterations)
        return rVolObj._calculate_rvol(self.winddown)


def runRvolOnEachWindow( rVolObj ):
    dfs = []
    try:
        for window in constants.slidingWindow:
            rVolDf = rVolObj.rvolBackPopulate(window)
            print('runRvolOnEachWindow ', rVolDf)
            if rVolDf is not None:
                dfs.append(rVolDf)

        return reduce(lambda left,right: pd.merge(left,right,on='range', how='outer'), dfs)
    except:
        return;

def runRvolOnEachDay( config, winddown ):
    end_date = constants.from_date_rvol
    dfs = []
    while end_date <= constants.to_date :
        start_date = end_date
        end_date += datetime.timedelta(days=1)
        populateRealisedVolDataObj = PopulateRealisedVolData(config, winddown, start_date, end_date)
        window_data = runRvolOnEachWindow(populateRealisedVolDataObj)
        if window_data is not None:
            window_data.insert(0, 'date', start_date)
            window_data.transpose().reset_index(drop=True).transpose()
            dfs.append(window_data)
            #print('runRvolOnEachDay ', dfs)

    df = pd.concat( dfs,axis=0,ignore_index=True)
    print('runRvolOnEachDay ', df)
    return df

def runRvolOnConfig():
    rVolData = {}
    for config in configurationObj:
        rVolTableKey = 'rvol-' + str(config['instrument_token'])
        winddownTableKey = 'winddown-' + str(config['instrument_token'])
        winddown = windDownDataObj[winddownTableKey]

        rVolData[rVolTableKey] = runRvolOnEachDay(config, winddown)
        print('runRvolOnConfig ', rVolData[rVolTableKey])

        try:
            rVolData[rVolTableKey].to_sql(rVolTableKey, engine, if_exists='replace')
        except Exception:
            pass

    return rVolData

def isRvolPopulated(configurationObj, rVolDataObj, constants):
    for config in configurationObj:
        tableKey = 'rvol-' + str(config['instrument_token'])

        if len(rVolDataObj[tableKey]) > 0 :
            return runRvolOnConfig()
            pass
        else:
            return runRvolOnConfig()
    return rVolDataObj


realisedVolData = isRvolPopulated(configurationObj, rVolDataObj, constants)