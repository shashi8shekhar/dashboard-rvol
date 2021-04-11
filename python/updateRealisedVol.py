from dataPipeline.login.kite import kite
from sql.engine import engine
from sql.configDetails import configurationObj
from sql.winddownDetails import windDownDataObj
from RealisedVol import RealisedVol
import constants
import pandas as pd
from functools import reduce

nan_value = 0

class PopulateRealisedVolData:
    #Gets historical data from Kite Connect
    def get_historical_data(self, instrument_token, from_date, to_date, interval):
	    return kite.historical_data(instrument_token, from_date, to_date, interval)

    def getRvol(self, instrument_token, tStart, tEnd, from_date, to_date, interval, slidingWindow, min_winddown):
        records = self.get_historical_data(instrument_token, from_date, to_date, interval)
        records_df = pd.DataFrame(records)
        #print(records_df.head())
        rVolObj = RealisedVol(records_df, tStart.strftime("%H:%M:%S"), tEnd.strftime("%H:%M:%S"), slidingWindow, min_winddown)
        return rVolObj._calculate_realised_vol()


def runRvolOnConfig():
    windDownData = {}
    for config in configurationObj:
        tableKey = 'winddown-' + str(config['instrument_token'])
        winddown = windDownDataObj[tableKey]

        for window in constants.slidingWindow:
            populateRealisedVolDataObj = PopulateRealisedVolData()

            windDownData[config['instrument_token']][window] = populateRealisedVolDataObj.getRvol(config['instrument_token'], config['t_start'], config['t_end'], constants.from_date, constants.to_date, constants.interval, window, constants.min_winddown)
    return rVol

realisedVolData = runRvolOnConfig()