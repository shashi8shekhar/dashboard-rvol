print('implied Vol.')
import engine
import configDetails
import instrument_details
import implied_Details
import constants
import pandas as pd
import numpy as np
import datetime
import implied_calc
from functools import reduce

nan_value = 0

class UpdateImpliedVol:
    def get_historical_data(self, kiteObj, instrument_token, from_date, to_date, interval):
        # print('inside get_historical_data', instrument_token, from_date, to_date, interval)
        return kiteObj.get_historical_data(instrument_token, from_date, to_date, interval)

    def fetch_contract(self, symbol, expiry):
        """
        Fetch strike and token detail for requested symbol
        Param symbol:(string) - Option contract symbol
        """
        token_list = []
        optionData = self.redis_db.symbol_data(symbol)
        for strike_detail in optionData:
            if strike_detail['expiry'] == str(expiry):
                token_list.append(strike_detail['token'])
        return token_list

    def get_expiry_list(self, instruments):
        expiry = instruments['expiry']
        return np.unique(expiry)

    def get_strike_list(self, instruments):
        strike = instruments['strike']
        return np.unique(strike)

    def get_iv_data(self):
        contract_detail = self.instrumentClass.fetch_token_detail(tick['instrument_token'])
        expiry_date = datetime.datetime.strptime(self.expiry, '%Y-%m-%d')
        # calculate time difference from contract expiry
        time_difference = (expiry_date - datetime.datetime.today()).days
        contract = 'NSE:{}'.format(contract_detail['name'])
        # fetch underlying contract ltp from Quote API call
        eq_detail = self.kite.quote([contract])

    def ivolBackPopulate(self, kiteObj, expiry_list, strike_list, config, instruments, window, start_date, end_date):
        print('ivolBackPopulate', config['tradingsymbol'], start_date)

        records = self.get_historical_data(kiteObj, config['instrument_token'], start_date, end_date, constants.interval_ivol)
        records_df = pd.DataFrame(records)

        print('records length', len(records_df.index))
        # print('strike_list length', len(strike_list))
        # print('expiry_list length', len(expiry_list))

        if len(records_df.index) == 0 :
            dataEmp = { 'dateTime': [] }

            emptyDf = pd.DataFrame(dataEmp)
            print('empty Data Frame', emptyDf)
            return emptyDf

        implied_calc_obj = implied_calc.ImpliedCalc(kiteObj, expiry_list, strike_list, config, instruments, records_df)
        return implied_calc_obj._calculate_implied()

    def runIvolOnEachWindow(self, kiteObj, expiry_list, strike_list, config, instruments, start_date, end_date ):
        dfs = []
        try:
            for window in constants.slidingWindow:
                # print('runIvolOnEachWindow', window)
                iVolDf = self.ivolBackPopulate(kiteObj, expiry_list, strike_list, config, instruments, window, start_date, end_date)
                print('return ivolBackPopulate length', len(iVolDf.index), iVolDf);
                if iVolDf is not None and len(iVolDf.index) > 0:
                    dfs.append(iVolDf)

            if len(dfs) > 0:
                return reduce(lambda left,right: pd.merge(left,right,on='dateTime', how='outer'), dfs)
            else:
                return dfs
        except:
            print('inside except', dfs)
            return

    def runIvolOnEachDay(self, kiteObj, expiry_list, strike_list, config, instruments, from_date, to_date ):
        end_date = from_date
        dfs = []
        df = []

        while end_date < to_date :
            start_date = end_date
            end_date += datetime.timedelta(days=1)

            window_data = self.runIvolOnEachWindow(kiteObj, expiry_list, strike_list, config, instruments, start_date, end_date)
            print('runIvolOnEachDay', end_date, to_date, end_date < to_date, window_data)

            if window_data is not None and len(window_data) > 0:
                # print('if window_data is not None:', config['tradingsymbol'], start_date, end_date, window_data)
                window_data.transpose().reset_index(drop=True).transpose()
                dfs.append(window_data)

        try:
            df = pd.concat( dfs,axis=0,ignore_index=True)
            return df
        except ValueError:
            return df

    def runIvolOnConfig(self, kiteObj, configurationObj, instrumentsDetailsObjData, constants):
        engineObj = engine.Engine.getInstance().getEngine()
        iVolData = {}

        for config in configurationObj:
            instrument_token = config['instrument_token']
            iVolTableKey = 'ivol-' + str(instrument_token)
            instrumentsTableKey = 'instruments-' + str(instrument_token)
            instruments = instrumentsDetailsObjData[instrumentsTableKey]

            instruments_df = pd.DataFrame(instruments)
            print(instruments_df.head())
            expiry_list = self.get_expiry_list(instruments_df)
            strike_list = self.get_strike_list(instruments_df)

            iVolData[iVolTableKey] = self.runIvolOnEachDay(kiteObj, expiry_list, strike_list, config, instruments, constants.from_date_ivol, constants.to_date)
            print(iVolTableKey, iVolData[iVolTableKey].head())
            try:
                print('runIvolOnConfig inside try', config['tradingsymbol'])
                iVolData[iVolTableKey].to_sql(iVolTableKey, con=engineObj, if_exists='replace', index=False)
            except ValueError as e:
                # print(e)
                return e

    def isInstrumentsPopulated(self, kiteObj, configurationObj, instrumentsDetailsObjData, constants):
        for config in configurationObj:
            tableKey = 'instruments-' + str(config['instrument_token'])
            # print('inside isInstrumentsPopulated, length', len(instrumentsDetailsObjData[tableKey]) > 0, config['tradingsymbol'])
            if len(instrumentsDetailsObjData[tableKey]) > 0 :
                return self.runIvolOnConfig(kiteObj, configurationObj, instrumentsDetailsObjData, constants)
            else:
                print('populate instruments')
                pass

    def runFullUpdate(self, kiteObj):
        configDetailsObj = configDetails.ConfigDetails.getInstance()
        configurationObjData = configDetailsObj.getConfig()

        instrumentsDetailsObj = instrument_details.InstrumentDetails.getInstance()
        instrumentsDetailsObjData = instrumentsDetailsObj.getInstruments()

        self.isInstrumentsPopulated(kiteObj, configurationObjData, instrumentsDetailsObjData, constants)

    def getLastUpdatedRow(self, config, iVolData):
        for i in reversed(range( len(iVolData) )):
            currentRowData = iVolData[i]
            if ( currentRowData['close'] == 0 ):
                iVolData.pop()
            else :
                date_time_str = currentRowData['dateTime'].strftime('%Y-%m-%d') + ' ' + config['t_start'].strftime("%H:%M:%S")
                date_time_obj = constants.IST.localize( datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S') )
                # date_time_obj = date_time_obj - datetime.timedelta(hours=1)

                return date_time_obj, iVolData

    def runSchedulerOnConfig(self, kiteObj, configurationObj, instrumentsDetailsObjData, iVolDetailsObjData, constants):
        iVolData = {}
        engineObj = engine.Engine.getInstance().getEngine()

        for config in configurationObj:
            instrument_token = config['instrument_token']
            iVolTableKey = 'ivol-' + str(instrument_token)
            instrumentsTableKey = 'instruments-' + str(instrument_token)
            instruments = instrumentsDetailsObjData[instrumentsTableKey]
            iVolData = iVolDetailsObjData[iVolTableKey]

            instruments_df = pd.DataFrame(instruments)
            # print(instruments_df.head())
            expiry_list = self.get_expiry_list(instruments_df)
            strike_list = self.get_strike_list(instruments_df)

            last_updated_time, iVolTrimmedData = self.getLastUpdatedRow(config, iVolData)

            print('last_updated_time ========', last_updated_time)

            curr_time = constants.to_date
            iVolTrimmedDataFrame = pd.DataFrame(iVolTrimmedData)

            iVolMergedDfs = []
            iVolMergedDf = []

            iVolMergedDfs.append(iVolTrimmedDataFrame)

            iVolForEachInterval = self.runIvolOnEachDay(kiteObj, expiry_list, strike_list, config, instruments,
                                                           last_updated_time, curr_time)
            print('iVolTrimmedData', iVolTrimmedData)
            print('iVolTrimmedDataFrame', iVolTrimmedDataFrame)


            print('iVolForEachInterval', iVolForEachInterval)

            if (len(iVolForEachInterval) > 0):
                iVolForEachInterval.transpose().reset_index(drop=True).transpose()
                iVolMergedDfs.append(iVolForEachInterval)
                iVolMergedDf = pd.concat(iVolMergedDfs, axis=0, ignore_index=True).drop_duplicates(subset=['dateTime'], keep='last').reset_index(drop=True)
                print('iVolForEachInterval after transpose', iVolForEachInterval)
                print('iVolMergedDfs', iVolMergedDfs)
                print('iVolMergedDf', iVolMergedDf)
            try:
                print('trying to insert into table', iVolTableKey, config['tradingsymbol'])
                print(iVolMergedDf.head())
                iVolMergedDf.to_sql(iVolTableKey, con=engineObj, if_exists='replace', index=False)
            except ValueError as e:
                print(e)
                pass

    def runScheduler(self, kiteObj):
        configDetailsObj = configDetails.ConfigDetails.getInstance()
        configurationObjData = configDetailsObj.getConfig()

        instrumentsDetailsObj = instrument_details.InstrumentDetails.getInstance()
        instrumentsDetailsObjData = instrumentsDetailsObj.getInstruments()

        iVolDetailsObj = implied_Details.IVolDetails.getInstance()
        iVolDetailsObjData = iVolDetailsObj.getIvol()

        self.runSchedulerOnConfig(kiteObj, configurationObjData, instrumentsDetailsObjData, iVolDetailsObjData, constants)
