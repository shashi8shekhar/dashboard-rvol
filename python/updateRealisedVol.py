print('updateRealisedVol')
import kite
import engine
import configDetails
import winddownDetails
import rVolDetails
import RealisedVol
import constants
import pandas as pd
import datetime
from functools import reduce
from pandas.errors import MergeError

nan_value = 0

class PopulateRealisedVolData:
    def __init__(self, config, winddown):
        self.winddown = winddown
        self.config = config
        self.iterations = constants.iterations

    def get_historical_data(self, instrument_token, from_date, to_date, interval):
        #print('inside get_historical_data', instrument_token, from_date, to_date, interval)
        kiteObj = kite.Kite()
        return kiteObj.get_historical_data(instrument_token, from_date, to_date, interval)

    def rvolBackPopulate(self, window, start_date, end_date):
        #print(self.config['tradingsymbol'], start_date, end_date, constants.interval_rvol, window)
        records = self.get_historical_data(self.config['instrument_token'], start_date, end_date, constants.interval_rvol)
        records_df = pd.DataFrame(records)

        print(self.config['tradingsymbol'], 'is Holiday: ', (len(records_df.index) == 0), 'Date: ', start_date, 'data len:', len(records_df.index) )
        if len(records_df.index) == 0 :
            rvolKey = str(window) + 'min'
            dataEmp = { 'range': [] }
            dataEmp.update({ rvolKey: [] })

            emptyDf = pd.DataFrame(dataEmp)
            print('empty Data Frame', emptyDf)
            return emptyDf

        rVolObj = RealisedVol(records_df, self.config['t_start'].strftime("%H:%M:%S"), self.config['t_end'].strftime("%H:%M:%S"), window, self.config['avg_hedge_per_day'], constants.iterations)
        return rVolObj._calculate_rvol(self.winddown)


def runRvolOnEachWindow( rVolObj, start_date, end_date ):
    dfs = []
    try:
        for window in constants.slidingWindow:
            rVolDf = rVolObj.rvolBackPopulate(window, start_date, end_date)
            #print('rvolBackPopulate', rVolDf);
            if rVolDf is not None:
                dfs.append(rVolDf)

        return reduce(lambda left,right: pd.merge(left,right,on='range', how='outer'), dfs)
    except:
        print('inside except')
        return

def runRvolOnEachDay( config, winddown, from_date, to_date ):
    end_date = from_date
    dfs = []
    df = []

    while end_date < to_date :
        start_date = end_date
        end_date += datetime.timedelta(days=1)
        populateRealisedVolDataObj = PopulateRealisedVolData(config, winddown)
        window_data = runRvolOnEachWindow(populateRealisedVolDataObj, start_date, end_date)
        if window_data is not None:
            #print('if window_data is not None:', config['tradingsymbol'], start_date, end_date, window_data)
            window_data.insert(0, 'date', start_date)
            window_data.transpose().reset_index(drop=True).transpose()
            dfs.append(window_data)

    try:
        df = pd.concat( dfs,axis=0,ignore_index=True)
        return df
    except ValueError:
        return df

def runRvolOnConfig(configurationObj, windDownDataObj, constants):
    rVolData = {}
    for config in configurationObj:
        rVolTableKey = 'rvol-' + str(config['instrument_token'])
        winddownTableKey = 'winddown-' + str(config['instrument_token'])
        winddown = windDownDataObj[winddownTableKey]

        rVolData[rVolTableKey] = runRvolOnEachDay(config, winddown, constants.from_date_rvol, constants.to_date)

        try:
            rVolData[rVolTableKey].to_sql(rVolTableKey, engine.Engine.getInstance().getEngine(), if_exists='replace')
            print(config['tradingsymbol'], ' Table Updated')
        except Exception:
            pass

    return rVolData

def isRvolPopulated(configurationObj, windDownDataObj, rVolDataObj, constants):
    for config in configurationObj:
        tableKey = 'rvol-' + str(config['instrument_token'])
        #print(config['tradingsymbol'])
        if len(rVolDataObj[tableKey]) > 0 :
            #return runRvolOnConfig(configurationObj, windDownDataObj, constants)
            pass
        else:
            return runRvolOnConfig(configurationObj, windDownDataObj, constants)
    return rVolDataObj


configDetailsObj = configDetails.ConfigDetails()
configurationObjData = configDetailsObj.getConfig()

winddownDetailsObj = winddownDetails.WinddownDetails()
winddownDetailsObjData = winddownDetailsObj.getWinddown()

rVolDetailsObj = rVolDetails.RealisedVolDetails()
rVolDetailsObjData = rVolDetailsObj.getRealisedVol()

realisedVolData = isRvolPopulated(configurationObjData, winddownDetailsObjData, rVolDetailsObjData, constants)