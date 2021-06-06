import pandas as pd
import numpy as np
import datetime
import math
import mibian
import constants

class ImpliedCalc:
    def __init__(self, kiteObj, expiry_list, strike_list, config, instruments, data):
        self.instruments = instruments
        self.config = config
        self.expiry = expiry_list
        self.strike = strike_list
        self.data = data
        self.kite = kiteObj
        
    def _updateData(self):
        self.data['day'] = pd.to_datetime(self.data['date'], format='%Y:%M:%D').dt.date
        self.data['time'] = pd.to_datetime(self.data['date'], format='%Y:%M:%D').dt.time

    def _getAtmStrikePrice(self, underlyingValue, strikePrices):
        return min(strikePrices, key=lambda x: abs(float(x) - underlyingValue))

    def count_day(self, startdate, enddate):
        """# Define a function to count the days to expiration
        """
        start = datetime.datetime(year=int(startdate[6:10]), month=int(startdate[0:2]), day=int(startdate[3:5]))
        end = datetime.datetime(year=int(enddate[6:10]), month=int(enddate[0:2]), day=int(enddate[3:5]))
        delta = end - start
        return delta.days

    def _get_implied_vol_mibian(self, UnderlyingPrice, StrikePrice, InterestRate, Daystoexpiration, callPrice):
        print('inside get iv', UnderlyingPrice, StrikePrice, InterestRate, Daystoexpiration, callPrice)
        c = mibian.BS([UnderlyingPrice, StrikePrice, InterestRate, Daystoexpiration], callPrice=callPrice)
        return c.impliedVolatility

    def _get_updated_iv_list(self, strike_price, row):
        updated_iv = {}
        updated_iv['strike'] = float(strike_price)
        updated_iv['close'] = float(row.close)

        date_time_str = row.date.strftime('%Y-%m-%d') + ' ' + row.date.strftime("%H:%M:%S")
        to_date_time_obj = constants.IST.localize(datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S'))
        from_date_time_obj = to_date_time_obj - datetime.timedelta(seconds=4 * 60)

        result = list(
            filter(lambda x: (float(x['strike']) == float(strike_price) and x['type'] == 'CE'), self.instruments))
        result.sort(key=lambda x: x['expiry'])

        records_kites = self.kite.get_quote(self.instruments['token'])
        print('records_kites', records_kites)

        for contract in self.instruments:
            token = contract['token']
            day_to_expiry = self.count_day(contract['expiry'], constants.to_date)


            result = list(
                filter(lambda x: (float(x['strike']) == float(strike_price) and x['type'] == 'CE'), self.instruments))



        for contract in result:
            token = contract['token']
            day_to_expiry = (constants.IST.localize(datetime.datetime.strptime(contract['expiry'], '%Y-%m-%d')) - constants.to_date).days
            print('date1',constants.IST.localize(datetime.datetime.strptime(contract['expiry'], '%Y-%m-%d')))
            print('date2', (constants.to_date))
            print('day_to_expiry', day_to_expiry)
            if day_to_expiry == 0 :
                day_to_expiry = 1

            if day_to_expiry < 100:
                print('expiry = ', contract['expiry'])
                records = self.kite.get_quote([contract['token']])
                # records = self.kite.get_historical_data(token, from_date_time_obj, to_date_time_obj, constants.interval_ivol)
                # print('strike_price', float(strike_price), 'expiry', contract['expiry'], 'type', contract['type'])
                # records_df = pd.DataFrame(records)
                # print(records_df.head())
                # print('records options length', len(records_df.index))

                iv = 0
                if (len(records)):
                    callPrice = records[len(records) - 1]['close']
                    iv = self._get_implied_vol_mibian(row.close, float(strike_price), constants.interest_rate_india,
                                                      day_to_expiry, callPrice)
                print('IV ================ ', iv)
                iv_key = str(contract['expiry']) + '_iv'
                updated_iv[iv_key] = iv
                updated_iv['dateTime'] = to_date_time_obj
        return updated_iv

    def _calculate_implied(self):
        self._updateData()
        # print('strike', self.strike)

        ivData = []
        for row in self.data.itertuples():
            strike_price = self._getAtmStrikePrice(row.close, self.strike)
            # print(self.data['date'], self.data['time'])
            ivDataEachTime = self._get_updated_iv_list(strike_price, row)
            print('ivDataEachTime', ivDataEachTime)
            ivData.append(ivDataEachTime)

            # print('instruments_token', instruments_token)
            # contract = 'NSE:{}'.format(contract_detail['name'])
            # fetch underlying contract ltp from Quote API call
            # eq_detail = self.kite.get_quote([instruments_token])

            # print('eq_detail', eq_detail)

        # Create DataFrame
        df = pd.DataFrame(ivData)
        # print('df', df)

        return df

############################
