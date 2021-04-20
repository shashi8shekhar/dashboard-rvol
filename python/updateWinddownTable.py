import kite
import engine
import configDetails
import winddownDetails
import winddown
import constants
import pandas as pd
from functools import reduce

nan_value = 0

class UpdateWinddownTable:
    #Gets historical data from Kite Connect
    def get_historical_data(self, instrument_token, from_date, to_date, interval):
        kiteObj = kite.Kite()
        return kiteObj.get_historical_data(instrument_token, from_date, to_date, interval)

    def getWinddown(self, instrument_token, tStart, tEnd, from_date, to_date, interval, slidingWindow, min_winddown):
        records = self.get_historical_data(instrument_token, from_date, to_date, interval)
        records_df = pd.DataFrame(records)
        print('inside getWinddown length', len(records_df))
        winddownObj = winddown.Winddown(records_df, tStart.strftime("%H:%M:%S"), tEnd.strftime("%H:%M:%S"), slidingWindow, min_winddown)
        return winddownObj._calculate_winddown()

    def runWinddownOnConfig(self, configurationObj, constants):
        windDownData = {}
        engineObj = engine.Engine.getInstance().getEngine()
        for config in configurationObj:
            windDownData[config['instrument_token']] = {}
            dfs = []
            for window in constants.slidingWindow:
                print(config['tradingsymbol'], window, 'min winddown')
                windDownData[config['instrument_token']][window] = self.getWinddown(config['instrument_token'], config['t_start'], config['t_end'], constants.from_date, constants.to_date, constants.interval, window, constants.min_winddown)
                dfs.append(windDownData[config['instrument_token']][window])
            windDownData[config['instrument_token']] = reduce(lambda left,right: pd.merge(left,right,on='range', how='outer'), dfs)

            tableKey = 'winddown-' + str(config['instrument_token'])
            try:
                print('in runWinddownOnConfig inside try', config['tradingsymbol'])
                print(windDownData[config['instrument_token']])
                windDownData[config['instrument_token']].to_sql(tableKey, con=engineObj, if_exists='replace', index=False)
            except ValueError as e:
                print(e)

        return windDownData

    def isWinddownPopulated(self, configurationObj, windDownDataObj, constants):
        for config in configurationObj:
            tableKey = 'winddown-' + str(config['instrument_token'])
            if len(windDownDataObj[tableKey]) > 0 :
                return self.runWinddownOnConfig(configurationObj, constants)
                pass
            else:
                return self.runWinddownOnConfig(configurationObj, constants)

    def updateWinddown(self):
        configDetailsObj = configDetails.ConfigDetails.getInstance()
        configurationObjData = configDetailsObj.getConfig()

        winddownDetailsObj = winddownDetails.WinddownDetails.getInstance()
        windDownDataObj = winddownDetailsObj.getWinddown()

        #print('windDownDataObj  === ', windDownDataObj)
        self.isWinddownPopulated(configurationObjData, windDownDataObj, constants)
