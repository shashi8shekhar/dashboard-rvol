print('inside rVolScheduler')
import engine
import configDetails
import winddownDetails
from rVolDetails import rVolDataObj
from RealisedVol import RealisedVol
import constants
import pandas as pd
import datetime
from functools import reduce
from updateRealisedVol import runRvolOnEachDay

print('all imported')

class RealTimePopulateRealisedVolData:
    def getLastUpdatedRow(self, config, rVolData):
        for i in reversed(range( len(rVolData) )):
            currentRowData = rVolData[i]
            if ( currentRowData['5min'] == 0 ):
                rVolData.pop()
            else :
                date_time_str = currentRowData['dateTime'].strftime('%Y-%m-%d') + ' ' + config['t_start'].strftime("%H:%M:%S")
                date_time_obj = constants.IST.localize( datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S') )
                date_time_obj = date_time_obj - datetime.timedelta(hours=1)

                return date_time_obj, rVolData

    def main_d(self):
        rVolData = {}
        print("inside main")
        configDetailsObj = configDetails.ConfigDetails()

        winddownDetailsObj = winddownDetails.WinddownDetails()
        windDownDataObj = winddownDetailsObj.getWinddown()
        engineObj = engine.Engine.getInstance().getEngine()

        for config in configDetailsObj.getConfig():
            rVolTableKey = 'rvol-' + str(config['instrument_token'])
            winddownTableKey = 'winddown-' + str(config['instrument_token'])
            winddown = windDownDataObj[winddownTableKey]
            rVolData = rVolDataObj[rVolTableKey]

            #print("test", config)

            last_updated_time, rVolTrimmedData = self.getLastUpdatedRow( config, rVolData )

            curr_time = constants.to_date
            rVolTrimmedDataFrame = pd.DataFrame(rVolTrimmedData)

            rVolMergedDfs = []
            rVolMergedDf = []

            #rVolTrimmedDataFrame.transpose().reset_index(drop=True).transpose()
            rVolMergedDfs.append(rVolTrimmedDataFrame)

            #print('rVolTrimmedDataFrame', rVolTrimmedDataFrame[-1])
            #print(config['tradingsymbol'], 'last_updated_time', last_updated_time, 'curr_time', curr_time )

            rVolForEachInterval = runRvolOnEachDay(config, winddown, last_updated_time, curr_time)

            #print('rVolForEachInterval', rVolForEachInterval )

            if ( len(rVolForEachInterval) > 0 ):
                rVolForEachInterval.transpose().reset_index(drop=True).transpose()
                rVolMergedDfs.append(rVolForEachInterval)
                rVolMergedDf = pd.concat( rVolMergedDfs, axis=0, ignore_index=True ).drop_duplicates(subset=['dateTime'], keep='last').reset_index(drop=True)

            #print( 'rVolMergedDf ', len(rVolMergedDf), 'rVolForEachInterval', len(rVolForEachInterval),  'rVolMergedDf', len(rVolMergedDf) )
            #print( 'rVolMergedDf ', rVolMergedDf.head())

            try:
                #print('trying to insert into table', rVolTableKey, config['tradingsymbol'])
                rVolMergedDf.to_sql(rVolTableKey, con=engineObj, if_exists='replace', index=False)
            except ValueError as e:
                #print(e)
                pass

        return rVolMergedDf

runRvolScheduler = RealTimePopulateRealisedVolData()
runRvolScheduler.main_d()