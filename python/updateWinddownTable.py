from dataPipeline.login.kite import kite
from sql.engine import engine
from sql.configDetails import configurationObj
from Winddown import Winddown
import constants
import pandas as pd
from functools import reduce

nan_value = 0

class PopulateWinddownData:
    #Gets historical data from Kite Connect
    def get_historical_data(self, instrument_token, from_date, to_date, interval):
	    return kite.historical_data(instrument_token, from_date, to_date, interval)

    def getWinddown(self, instrument_token, tStart, tEnd, from_date, to_date, interval, slidingWindow, min_winddown):
        records = self.get_historical_data(instrument_token, from_date, to_date, interval)
        records_df = pd.DataFrame(records)
        #print(records_df.head())
        winddownObj = Winddown(records_df, tStart.strftime("%H:%M:%S"), tEnd.strftime("%H:%M:%S"), slidingWindow, min_winddown)
        return winddownObj._calculate_winddown()


def runWinddownOnConfig():
    windDownData = {}
    for config in configurationObj:
        windDownData[config['instrument_token']] = {}
        dfs = []
        for window in constants.slidingWindow:
            populateWinddownDataObj = PopulateWinddownData()
            print(config['tradingsymbol'], window, 'min winddown')
            windDownData[config['instrument_token']][window] = populateWinddownDataObj.getWinddown(config['instrument_token'], config['t_start'], config['t_end'], constants.from_date, constants.to_date, constants.interval, window, constants.min_winddown)
            dfs.append(windDownData[config['instrument_token']][window])
        windDownData[config['instrument_token']] = reduce(lambda left,right: pd.merge(left,right,on='range', how='outer'), dfs)
        #print(windDownData[config['instrument_token']])

        tableKey = 'winddown-' + str(config['instrument_token'])
        try:
            windDownData[config['instrument_token']].to_sql(tableKey, engine, if_exists='fail')
        except Exception:
            pass

    return windDownData

windDownData = runWinddownOnConfig()