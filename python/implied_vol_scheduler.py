print('implied Vol.')
import engine
import configDetails
import instrument_details
import constants
import pandas as pd
import numpy as np
import datetime
import json
import implied_vol_model
from sqlalchemy.types import String, Date, DateTime
import winddownDetails


def get_key(strike, id):
    return str(strike) + '-' + id


class ImpliedVolScheduler:
    @staticmethod
    def get_expiry_list(instruments):
        expiry = list(instruments['expiry'])
        return np.unique(expiry)

    @staticmethod
    def get_strike_list(instruments):
        strike = list(instruments['strike'])
        return np.unique(strike)

    @staticmethod
    def _getAtmStrikePrice(underlyingValue, strikePrices):
        return min(strikePrices, key=lambda x: abs(float(x) - underlyingValue))

    @staticmethod
    def count_time(wind_down_sum, startdate, enddate, tEnd, minutes_in_a_yr=525600):
        """# Define a function to count the time to expiration in Year
        """

        date_time_str = enddate + ' ' + tEnd.strftime("%H:%M:%S")
        end_date_time_obj = constants.IST.localize(datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S'))

        # curr_winddown_dict = [wind_down for wind_down in wind_down if wind_down['range'] == range][0]
            # curr_winddown = float(curr_winddown_dict[rvolKey])

        # convert the timedelta to datetime and then extract minute
        duration_in_s = (end_date_time_obj - startdate).total_seconds()
        minutes = divmod(duration_in_s, 60)[0]  # Seconds in a minute = 60

        # today_min = ( minutes % 1440 ) * wind_down_sum
        today_min = wind_down_sum * 1440.0
        extra_min = ( minutes // 1440 ) * 1440.0

        # print('wind_down_sum', wind_down_sum, minutes, wind_down_sum * 1440, today_min, extra_min, (today_min + extra_min) / 60, (today_min + extra_min) / minutes_in_a_yr)

        # print(startdate, end_date_time_obj, minutes, minutes / minutes_in_a_yr)
        return (today_min + extra_min) / minutes_in_a_yr

    @staticmethod
    def get_avg_bid_ask(tokenData):
        if (tokenData['depth']['buy'][0]['price'] == 0 or tokenData['depth']['sell'][0]['price'] == 0):
            return tokenData['last_price']
        else:
            return (tokenData['depth']['buy'][0]['price'] + tokenData['depth']['sell'][0]['price']) / 2

    def runSchedulerOnConfig(self, kiteObj, configurationObj, instrumentsDetailsObjData, constants, windDownDataObj):
        engine_obj = engine.Engine.getInstance().getEngine()

        for config in configurationObj:
            t_start = config['t_start'].strftime('%H:%M:%S')
            t_end = config['t_end'].strftime('%H:%M:%S')

            date_time_str = constants.to_date.strftime('%Y-%m-%d') + ' ' + t_end
            date_time_obj = constants.IST.localize(datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S'))
            date_time_obj = date_time_obj + datetime.timedelta(minutes=3)
            end_time = date_time_obj.strftime("%H:%M:%S")

            t_now = constants.to_date.strftime('%H:%M:%S')
            is_active = t_start <= t_now <= end_time

            if not is_active:
                print('Market Closed!')
                return

            winddownTableKey = 'winddown-' + str(config['instrument_token'])
            winddown = windDownDataObj[winddownTableKey]
            wind_down_sum = 0.0

            for (i, range) in enumerate(winddown):
                if constants.to_date.strftime("%H:%M:%S") < str(winddown[i]['range']):
                    wind_down_sum = wind_down_sum + float(winddown[i]['5min'])

                    print(constants.to_date.strftime("%H:%M:%S"))
                    print(str(winddown[i]['range']))
                    print(float(winddown[i]['5min']))
                    print(wind_down_sum)

            instrument_token = config['instrument_token']
            instruments_table_key = 'instruments-' + str(instrument_token)
            instruments = instrumentsDetailsObjData[instruments_table_key]

            instruments_df = pd.DataFrame(instruments)
            # print(instruments_df.head())

            expiry_list = self.get_expiry_list(instruments_df)
            strike_list = self.get_strike_list(instruments_df)

            # spot_price_obj = kiteObj.get_quote(instrument_token)
            # print('spot_price_obj ==== ', spot_price_obj)

            for expiry in expiry_list:
                each_row_data_list = []
                each_row_data = {}
                i_vol_table_key = 'ivol-' + str(expiry) + '-' + str(instrument_token)

                current_expiry_instruments_df = instruments_df.loc[instruments_df['expiry'] == expiry]
                future_all_df = instruments_df.loc[
                    (instruments_df['type'] == 'FUT') & (instruments_df['expiry'] >= expiry)]
                future_all_df.sort_values(by=['expiry'], inplace=True, ascending=True)

                # print('expiry date = ', expiry)
                # print(future_all_df.head())

                if len(future_all_df.index) == 0:
                    break

                # token_list = []
                future_token = future_all_df.iloc[0]['token']

                token_list = list(current_expiry_instruments_df['token'])
                token_list.append(future_token)

                full_detail = kiteObj.get_quote(token_list)
                last_price_future = full_detail[str(future_token)]['last_price']
                last_trade_time = full_detail[str(future_token)]['last_trade_time']
                atm_strike = self._getAtmStrikePrice(last_price_future, strike_list)

                # PrettyJson_fut_detail = json.dumps(full_detail, indent=4, separators=(',', ': '), sort_keys=True, default=default)
                # print(PrettyJson_fut_detail)
                # print('last_price_future = ', last_price_future)
                # print('ATM Strike = ', atm_strike)

                call_otm_df = current_expiry_instruments_df.loc[(current_expiry_instruments_df['type'] == 'CE') & (
                        current_expiry_instruments_df['strike'] > atm_strike)]
                put_otm_df = current_expiry_instruments_df.loc[(current_expiry_instruments_df['type'] == 'PE') & (
                        current_expiry_instruments_df['strike'] < atm_strike)]
                atm_df = current_expiry_instruments_df.loc[((current_expiry_instruments_df['type'] == 'CE') | (
                        current_expiry_instruments_df['type'] == 'PE')) & (
                                                                   current_expiry_instruments_df['strike'] == float(
                                                               atm_strike))]

                # print(atm_df)
                # PrettyJson_atm_detail = json.dumps(full_detail[str(atm_df.iloc[0]['token'])], indent=4, separators=(',', ': '), sort_keys=True, default=default)
                # print(PrettyJson_atm_detail)

                call_otm_df = call_otm_df.sort_values('strike').head(20)
                put_otm_df.sort_values(by=['strike'], inplace=True, ascending=False)
                put_otm_df = put_otm_df.head(20)

                # print(call_otm_df, len(call_otm_df.index))
                # print(put_otm_df, len(put_otm_df.index))

                # time in year
                time_to_expiry = self.count_time(wind_down_sum, constants.to_date, expiry, config['t_end'], constants.minutes_in_a_yr)

                atm_ce = full_detail[str(atm_df.iloc[0]['token'])]['last_price']
                atm_pe = full_detail[str(atm_df.iloc[1]['token'])]['last_price']
                # print(json.dumps(full_detail[str(atm_df.iloc[0]['token'])], indent=4, separators=(',', ': '), sort_keys=True, default=default))
                # print(json.dumps(full_detail[str(atm_df.iloc[1]['token'])], indent=4, separators=(',', ': '), sort_keys=True, default=default))
                # forward_price = ForwardPrice(spot_price_obj[str(instrument_token)]['last_price'], time_to_expiry, constants.interest_rate_india, 0)
                forward_price_synthetic = implied_vol_model.syntheticFuture(float(atm_ce), float(atm_pe),
                                                                            float(atm_strike),
                                                                            time_to_expiry,
                                                                            constants.interest_rate_india)
                # print('expiry, ', 'ForwardPrice, ', 'syntheticFuture, ', 'last_price_future, ', 'atm_CE, ', 'atm_PE')
                # print(expiry, forward_price, forward_price_synthetic, last_price_future, round(atm_ce, 2), round(atm_pe, 2))
                # print('syntheticFuture - ForwardPrice, ', ' last_price_future - ForwardPrice, ', 'last_price_future - syntheticFuture')
                # print(round(forward_price_synthetic - forward_price, 2), round(last_price_future - forward_price, 2), round(last_price_future - forward_price_synthetic, 2))

                last_price_future = forward_price_synthetic
                skew_param = {}

                # calculate ATM IV
                atm_strike = round(atm_df.iloc[0]['strike'], 2)

                # Common Data
                each_row_data['dateTime'] = last_trade_time
                each_row_data['atm_strike'] = round(atm_strike, 2)
                each_row_data['close'] = round(last_price_future, 2)

                atm_index = 0
                option_type = 'c'
                if last_price_future > atm_strike:
                    atm_index = 1
                    option_type = 'p'
                last_price_atm = self.get_avg_bid_ask( full_detail[str(atm_df.iloc[atm_index]['token'])] )
                iv, delta, gamma, theta, vega, rho = implied_vol_model.euro_implied_vol_76(option_type,
                                                                                           float(last_price_future),
                                                                                           float(atm_strike),
                                                                                           time_to_expiry,
                                                                                           constants.interest_rate_india,
                                                                                           float(last_price_atm))

                each_row_data[get_key(atm_strike, 'iv')] = round(iv * 100, 2)
                each_row_data[get_key(atm_strike, 'delta')] = delta
                each_row_data[get_key(atm_strike, 'gamma')] = gamma
                each_row_data[get_key(atm_strike, 'theta')] = theta
                each_row_data[get_key(atm_strike, 'vega')] = vega
                skew_param['atm_iv'] = round(iv * 100, 2)

                #print('ATM ===== ', 'expiry', 'avg c/p price', 'atm_strike', 'IV', 'delta', 'gamma', 'theta', 'vega', 'rho')
                #print('ATM ===== ', expiry, last_price_atm, atm_strike, round(iv * 100, 2), delta, gamma, theta, vega, rho)

                # calculate OTM CALL IV
                for index, row in call_otm_df.iterrows():
                    current_strike = round(row['strike'], 2)

                    last_price = self.get_avg_bid_ask( full_detail[str(row['token'])] )
                    iv, delta, gamma, theta, vega, rho = implied_vol_model.euro_implied_vol_76('c',
                                                                                               float(last_price_future),
                                                                                               float(row['strike']),
                                                                                               time_to_expiry,
                                                                                               constants.interest_rate_india,
                                                                                               float(last_price))

                    each_row_data[get_key(current_strike, 'iv')] = round(iv * 100, 2)
                    each_row_data[get_key(current_strike, 'delta')] = delta
                    each_row_data[get_key(current_strike, 'gamma')] = gamma
                    each_row_data[get_key(current_strike, 'theta')] = theta
                    each_row_data[get_key(current_strike, 'vega')] = vega
                    skew_param['call_iv'] = round(iv * 100, 2)
                    if 0.23 <= delta <= 0.26 :
                        skew_param['call_iv'] = round(iv * 100, 2)

                    #print('OTM CALL ===== ', 'expiry', 'call price', 'strike', 'IV', 'delta', 'gamma', 'theta', 'vega', 'rho')
                    #print('OTM CALL ===== ', expiry, last_price, row['strike'], round(iv * 100, 2), delta, gamma, theta, vega, rho)

                # calculate OTM PUT IV
                for index, row in put_otm_df.iterrows():
                    current_strike = round(row['strike'], 2)

                    last_price = self.get_avg_bid_ask(full_detail[str(row['token'])])
                    iv, delta, gamma, theta, vega, rho = implied_vol_model.euro_implied_vol_76('p',
                                                                                               float(last_price_future),
                                                                                               float(row['strike']),
                                                                                               time_to_expiry,
                                                                                               constants.interest_rate_india,
                                                                                               float(last_price))
                    each_row_data[get_key(current_strike, 'iv')] = round(iv * 100, 2)
                    each_row_data[get_key(current_strike, 'delta')] = delta
                    each_row_data[get_key(current_strike, 'gamma')] = gamma
                    each_row_data[get_key(current_strike, 'theta')] = theta
                    each_row_data[get_key(current_strike, 'vega')] = vega
                    skew_param['put_iv'] = round(iv * 100, 2)
                    if -0.26 <= delta <= -0.23 :
                        skew_param['put_iv'] = round(iv * 100, 2)

                    #print('OTM PUT ===== ', 'expiry', 'put price', 'strike', 'IV', 'delta', 'gamma', 'theta', 'vega', 'rho')
                    #print('OTM PUT ===== ', expiry, last_price, row['strike'], round(iv * 100, 2), delta, gamma, theta, vega, rho)

                each_row_data['skew'] = implied_vol_model.skew_25_delta(skew_param)
                each_row_data_list.append(each_row_data)
                each_row_data_list_df = pd.DataFrame(each_row_data_list)

                try:
                    print('trying to insert into IVol Table', i_vol_table_key, config['tradingsymbol'], 'dateTime')
                    # print(each_row_data_list_df.head())
                    each_row_data_list_df.to_sql(i_vol_table_key, con=engine_obj, if_exists='append', index=False)
                except:
                    print('inside exception')
                    query = 'select * from `' + i_vol_table_key + '`'
                    #query = 'SELECT * FROM ' + i_vol_table_key
                    data = pd.read_sql(query, engine_obj)
                    df2 = pd.concat([data, each_row_data_list_df])
                    print(df2.head())
                    df2.to_sql(name=i_vol_table_key, con=engine_obj, if_exists='replace', index=False)

    def runScheduler(self, kiteObj):
        config_details_obj = configDetails.ConfigDetails.getInstance()
        configuration_obj_data = config_details_obj.getConfig()

        instruments_details_obj = instrument_details.InstrumentDetails.getInstance()
        instruments_details_obj_data = instruments_details_obj.getInstruments()

        winddownDetailsObj = winddownDetails.WinddownDetails.getInstance()
        windDownDataObj = winddownDetailsObj.getWinddown()

        self.runSchedulerOnConfig(kiteObj, configuration_obj_data, instruments_details_obj_data, constants, windDownDataObj)



def default(o):
    if isinstance(o, (datetime.date, datetime.datetime)):
        return o.isoformat()


