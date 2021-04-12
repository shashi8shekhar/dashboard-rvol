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
    def __init__(self, winddown, config):
        self.winddown = winddown
        self.config = config
        self.iterations = constants.iterations

    #Gets historical data from Kite Connect
    def get_historical_data(self, instrument_token, from_date, to_date, interval):
	    return kite.historical_data(instrument_token, from_date, to_date, interval)

    def rvolBackPopulate(self, window):
        records = self.get_historical_data(self.config['instrument_token'], constants.from_date_rvol, constants.to_date, constants.interval_rvol)
        records_df = pd.DataFrame(records)
        print(records_df.head())
        print(self.winddown)
        rVolObj = RealisedVol(records_df, self.config.t_start.strftime("%H:%M:%S"), self.config.t_end.strftime("%H:%M:%S"), window, self.config.avg_hedge_per_day, constants.iterations)
        return rVolObj._calculate_realised_vol()


def runRvolOnConfig():
    windDownData = {}
    for config in configurationObj:
        tableKey = 'winddown-' + str(config['instrument_token'])
        winddown = windDownDataObj[tableKey]

        for window in constants.slidingWindow:
            populateRealisedVolDataObj = PopulateRealisedVolData(winddown, config)

            windDownData[config['instrument_token']][window] = populateRealisedVolDataObj.rvolBackPopulate(window)

    return rVol

realisedVolData = runRvolOnConfig()