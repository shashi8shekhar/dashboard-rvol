print('updateRealisedVol')
import kite
import engine
import configDetails
import winddownDetails
import rVolDetails
import realisedVol
import constants
import pandas as pd
import datetime
from functools import reduce

nan_value = 0

class UpdateRealisedVol:
    def get_historical_data(self, instrument_token, from_date, to_date, interval):
        #print('inside get_historical_data', instrument_token, from_date, to_date, interval)
        kiteObj = kite.Kite()
        return kiteObj.get_historical_data(instrument_token, from_date, to_date, interval)

    def rvolBackPopulate(self, config, winddown, window, start_date, end_date):
        print(config['tradingsymbol'], start_date, end_date, constants.interval_rvol, window)
        records = self.get_historical_data(config['instrument_token'], start_date, end_date, constants.interval_rvol)
        records_df = pd.DataFrame(records)

        print('is Holiday: ', (len(records_df.index) == 0), 'Date: ', start_date, 'data len:', len(records_df.index) )
        if len(records_df.index) == 0 :
            rvolKey = str(window) + 'min'
            dataEmp = { 'dateTime': [] }
            dataEmp.update({ rvolKey: [] })

            emptyDf = pd.DataFrame(dataEmp)
            print('empty Data Frame', emptyDf)
            return emptyDf

        rVolObj = realisedVol.RealisedVol(records_df, config['t_start'].strftime("%H:%M:%S"), config['t_end'].strftime("%H:%M:%S"), window, config['avg_hedge_per_day'], constants.iterations)
        return rVolObj._calculate_rvol(winddown, start_date)

    def runRvolOnEachWindow(self, config, winddown, start_date, end_date ):
        dfs = []
        try:
            for window in constants.slidingWindow:
                rVolDf = self.rvolBackPopulate(config, winddown, window, start_date, end_date)
                #print('rvolBackPopulate', rVolDf);
                if rVolDf is not None:
                    dfs.append(rVolDf)

            return reduce(lambda left,right: pd.merge(left,right,on='dateTime', how='outer'), dfs)
        except:
            print('inside except')
            return

    def runRvolOnEachDay(self, config, winddown, from_date, to_date ):
        end_date = from_date
        dfs = []
        df = []

        while end_date < to_date :
            start_date = end_date
            end_date += datetime.timedelta(days=1)

            window_data = self.runRvolOnEachWindow(config, winddown, start_date, end_date)
            if window_data is not None:
                print('if window_data is not None:', config['tradingsymbol'], start_date, end_date, window_data)
                window_data.transpose().reset_index(drop=True).transpose()
                dfs.append(window_data)

        try:
            df = pd.concat( dfs,axis=0,ignore_index=True)
            return df
        except ValueError:
            return df

    def runRvolOnConfig(self, configurationObj, windDownDataObj, constants):
        rVolData = {}
        engineObj = engine.Engine.getInstance().getEngine()
        print('engineObj ', engineObj)
        for config in configurationObj:
            rVolTableKey = 'rvol-' + str(config['instrument_token'])
            winddownTableKey = 'winddown-' + str(config['instrument_token'])
            winddown = windDownDataObj[winddownTableKey]

            rVolData[rVolTableKey] = self.runRvolOnEachDay(config, winddown, constants.from_date_rvol, constants.to_date)
            print(rVolTableKey, rVolData[rVolTableKey].head())
            try:
                print('runRvolOnConfig inside try', config['tradingsymbol'])
                rVolData[rVolTableKey].to_sql(rVolTableKey, con=engineObj, if_exists='replace', index=False)
            except ValueError as e:
                print(e)

    def isRvolPopulated(self, configurationObj, windDownDataObj, rVolDataObj, constants):
        for config in configurationObj:
            tableKey = 'rvol-' + str(config['instrument_token'])
            print('inside isRvolPopulated', len(rVolDataObj[tableKey]) > 0 , config['tradingsymbol'])
            if len(rVolDataObj[tableKey]) > 0 :
                return self.runRvolOnConfig(configurationObj, windDownDataObj, constants)
                pass
            else:
                return self.runRvolOnConfig(configurationObj, windDownDataObj, constants)

    def runFullUpdate(self):
        configDetailsObj = configDetails.ConfigDetails.getInstance()
        configurationObjData = configDetailsObj.getConfig()

        winddownDetailsObj = winddownDetails.WinddownDetails.getInstance()
        winddownDetailsObjData = winddownDetailsObj.getWinddown()

        rVolDetailsObj = rVolDetails.RVolDetails.getInstance()
        rVolDetailsObjData = rVolDetailsObj.getRvol()

        self.isRvolPopulated(configurationObjData, winddownDetailsObjData, rVolDetailsObjData, constants)
