print('inside rVolScheduler')
import engine
import configDetails
import winddownDetails
import rVolDetails
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
                date_time_str = currentRowData['date'].strftime('%Y-%m-%d') + ' ' + config['t_start'].strftime("%H:%M:%S")
                date_time_obj = constants.IST.localize( datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S') )
                date_time_obj = date_time_obj - datetime.timedelta(hours=1)

                return date_time_obj, rVolData

    def runSchedulerOnConfig(self):
        rVolData = {}
        print("inside runSchedulerOnConfig")
        configDetailsObj = configDetails.ConfigDetails()

        winddownDetailsObj = winddownDetails.WinddownDetails()
        windDownDataObj = winddownDetailsObj.getWinddown()

        rVolDetailsObj = rVolDetails.RealisedVolDetails()
        rVolDetailsObjData = rVolDetailsObj.getRealisedVol()

        for config in configDetailsObj.getConfig():
            rVolTableKey = 'rvol-' + str(config['instrument_token'])
            winddownTableKey = 'winddown-' + str(config['instrument_token'])
            winddown = windDownDataObj[winddownTableKey]
            rVolData = rVolDetailsObjData[rVolTableKey]

            #print("test", config)

            last_updated_time, rVolTrimmedData = self.getLastUpdatedRow( config, rVolData )

            curr_time = constants.to_date
            rVolTrimmedDataFrame = pd.DataFrame(rVolTrimmedData)

            rVolMergedDfs = []
            rVolMergedDf = []

            #rVolTrimmedDataFrame.transpose().reset_index(drop=True).transpose()
            rVolMergedDfs.append(rVolTrimmedDataFrame)

            #print('rVolTrimmedDataFrame', rVolTrimmedDataFrame)
            print( config['tradingsymbol'], 'last_updated_time', last_updated_time, 'curr_time', curr_time )

            rVolForEachInterval = runRvolOnEachDay(config, winddown, last_updated_time, curr_time)

            #print('rVolForEachInterval', rVolForEachInterval)

            if ( len(rVolForEachInterval) > 0 ):
                rVolForEachInterval.transpose().reset_index(drop=True).transpose()
                rVolMergedDfs.append(rVolForEachInterval)
                rVolMergedDf = pd.concat( rVolMergedDfs, axis=0, ignore_index=True )

            #print('rVolMergedDf ', rVolMergedDf)

            try:
                rVolMergedDf.to_sql(rVolTableKey, engine.Engine.getInstance().getEngine(), if_exists='replace')
                print(config['tradingsymbol'], ' Table Updated')
            except Exception:
                print('inside exception')
                pass
        return rVolData


if __name__ == "__main__":
    obj = RealTimePopulateRealisedVolData()
    obj.runSchedulerOnConfig()


