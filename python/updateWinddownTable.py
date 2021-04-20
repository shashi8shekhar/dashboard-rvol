import kite
import engine
import configDetails
import winddownDetails
import winddown
import constants
import pandas as pd
from functools import reduce

nan_value = 0

class PopulateWinddownData:
    #Gets historical data from Kite Connect
    def get_historical_data(self, instrument_token, from_date, to_date, interval):
        kiteObj = kite.Kite()
        return kiteObj.get_historical_data(instrument_token, from_date, to_date, interval)

    def getWinddown(self, instrument_token, tStart, tEnd, from_date, to_date, interval, slidingWindow, min_winddown):
        records = self.get_historical_data(instrument_token, from_date, to_date, interval)
        records_df = pd.DataFrame(records)
        #print(records_df.head())
        winddownObj = winddown.Winddown(records_df, tStart.strftime("%H:%M:%S"), tEnd.strftime("%H:%M:%S"), slidingWindow, min_winddown)
        return winddownObj._calculate_winddown()


def runWinddownOnConfig(configurationObj, constants):
    windDownData = {}
    engineObj = engine.Engine.getInstance().getEngine()
    for config in configurationObj:
        windDownData[config['instrument_token']] = {}
        dfs = []
        for window in constants.slidingWindow:
            populateWinddownDataObj = PopulateWinddownData()
            #print(config['tradingsymbol'], window, 'min winddown')
            windDownData[config['instrument_token']][window] = populateWinddownDataObj.getWinddown(config['instrument_token'], config['t_start'], config['t_end'], constants.from_date, constants.to_date, constants.interval, window, constants.min_winddown)
            dfs.append(windDownData[config['instrument_token']][window])
        windDownData[config['instrument_token']] = reduce(lambda left,right: pd.merge(left,right,on='range', how='outer'), dfs)

        tableKey = 'winddown-' + str(config['instrument_token'])
        try:
            windDownData[config['instrument_token']].to_sql(tableKey, con=engineObj, if_exists='replace', index=False)
        except ValueError as e:
            print(e)

    return windDownData

def isWinddownPopulated(configurationObj, windDownDataObj, constants):
    for config in configurationObj:
        tableKey = 'winddown-' + str(config['instrument_token'])

        if len(windDownDataObj[tableKey]) > 0 :
            return runWinddownOnConfig(configurationObj, constants)
            pass
        else:
            return runWinddownOnConfig(configurationObj, constants)
    return windDownDataObj

configDetailsObj = configDetails.ConfigDetails.getInstance()
configurationObjData = configDetailsObj.getConfig()

winddownDetailsObj = winddownDetails.WinddownDetails()
windDownDataObj = winddownDetailsObj.getWinddown()

windDownData = isWinddownPopulated(configurationObjData, windDownDataObj, constants)