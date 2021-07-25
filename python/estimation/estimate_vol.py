import numpy as np
from estimation.Functions import EstimationModel
from scipy.optimize import minimize
import pandas as pd
import estimation.Constants as con

print('Estimate Vol')
import engine
import configDetails
import instrument_details
import constants
import datetime
import implied_vol_model
import json
from sqlalchemy.types import String, Date, DateTime


# if __name__ == "__main__":
#     main()

class EstimateVolData:
    @staticmethod
    def get_expiry_list(instruments):
        expiry = list(instruments['expiry'])
        return np.unique(expiry)

    @staticmethod
    def get_strike_list(instruments):
        strike = [float(i) for i in instruments['strike']]
        return np.unique(strike)

    @staticmethod
    def _getAtmStrikePrice(underlyingValue, strikePrices):
        return min(strikePrices, key=lambda x: abs(float(x) - underlyingValue))

    @staticmethod
    def count_time(startdate, enddate, tEnd, minutes_in_a_yr=525600):
        """# Define a function to count the time to expiration in Year
        """
        date_time_str = enddate + ' ' + tEnd.strftime("%H:%M:%S")
        end_date_time_obj = constants.IST.localize(datetime.datetime.strptime(date_time_str, '%Y-%m-%d %H:%M:%S'))

        # convert the timedelta to datetime and then extract minute
        duration_in_s = (end_date_time_obj - startdate).total_seconds()
        minutes = divmod(duration_in_s, 60)[0]  # Seconds in a minute = 60

        # print(startdate, end_date_time_obj, minutes, minutes / minutes_in_a_yr)
        return minutes / minutes_in_a_yr

    @staticmethod
    def get_avg_bid_ask(tokenData):
        return (tokenData['depth']['buy'][0]['price'] + tokenData['depth']['sell'][0]['price']) / 2

    def runSchedulerOnConfig(self, kiteObj, configurationObj, instrumentsDetailsObjData, constants):
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
                # return

            instrument_token = config['instrument_token']
            tradingsymbol = config['tradingsymbol']
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
                i_vol_table_key = 'estVol-' + str(expiry) + '-' + str(instrument_token)

                current_expiry_instruments_df = instruments_df.loc[instruments_df['expiry'] == expiry]
                future_all_df = instruments_df.loc[
                    (instruments_df['type'] == 'FUT') & (instruments_df['expiry'] >= expiry)]
                future_all_df.sort_values(by=['expiry'], inplace=True, ascending=True)

                print('expiry date = ', expiry)
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

                call_otm_df = current_expiry_instruments_df.loc[(current_expiry_instruments_df['type'] == 'CE') & (
                        current_expiry_instruments_df['strike'] > atm_strike)]
                put_otm_df = current_expiry_instruments_df.loc[(current_expiry_instruments_df['type'] == 'PE') & (
                        current_expiry_instruments_df['strike'] < atm_strike)]
                atm_df = current_expiry_instruments_df.loc[((current_expiry_instruments_df['type'] == 'CE') | (
                        current_expiry_instruments_df['type'] == 'PE')) & (
                                                                   current_expiry_instruments_df['strike'] == float(
                                                               atm_strike))]

                call_otm_df = call_otm_df.sort_values('strike').head(40)
                put_otm_df.sort_values(by=['strike'], inplace=True, ascending=False)
                put_otm_df = put_otm_df.head(40)

                estimation_model = EstimationModel(kiteObj, full_detail, last_price_future, last_trade_time, atm_strike,
                                                   expiry, strike_list, tradingsymbol, atm_df, put_otm_df, call_otm_df, current_expiry_instruments_df)
                estimation_model.get_data()
                estimation_model.call_vol_est()

                # time in year
                time_to_expiry = self.count_time(constants.to_date, expiry, config['t_end'], constants.minutes_in_a_yr)

                atm_ce = full_detail[str(atm_df.iloc[0]['token'])]['last_price']
                atm_pe = full_detail[str(atm_df.iloc[1]['token'])]['last_price']
                forward_price_synthetic = implied_vol_model.syntheticFuture(float(atm_ce), float(atm_pe),
                                                                            float(atm_strike),
                                                                            time_to_expiry,
                                                                            constants.interest_rate_india)
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
                last_price_atm = self.get_avg_bid_ask(full_detail[str(atm_df.iloc[atm_index]['token'])])

                # calculate OTM CALL IV
                for index, row in call_otm_df.iterrows():
                    current_strike = round(row['strike'], 2)
                    last_price = self.get_avg_bid_ask(full_detail[str(row['token'])])

                each_row_data_list.append(each_row_data)
                each_row_data_list_df = pd.DataFrame(each_row_data_list)

                print(each_row_data)

                try:
                    print('trying to insert into IVol Table', i_vol_table_key, config['tradingsymbol'], 'dateTime')
                    # print(each_row_data_list_df.head())
                    # each_row_data_list_df.to_sql(i_vol_table_key, con=engine_obj, if_exists='append', index=False)
                except:
                    print('inside exception')
                    query = 'select * from `' + i_vol_table_key + '`'
                    # query = 'SELECT * FROM ' + i_vol_table_key
                    data = pd.read_sql(query, engine_obj)
                    df2 = pd.concat([data, each_row_data_list_df])
                    print(df2.head())
                    df2.to_sql(name=i_vol_table_key, con=engine_obj, if_exists='replace', index=False)

    def runFullUpdate(self, kiteObj):
        config_details_obj = configDetails.ConfigDetails.getInstance()
        configuration_obj_data = config_details_obj.getConfig()

        instruments_details_obj = instrument_details.InstrumentDetails.getInstance()
        instruments_details_obj_data = instruments_details_obj.getInstruments()
        self.runSchedulerOnConfig(kiteObj, configuration_obj_data, instruments_details_obj_data, constants)

    def call_vol_est_main(self, estimation_model):
        result = minimize(estimation_model.func_estimate_slope, con.par_slope)
        # con1 = {'type': 'ineq', 'fun': fc.constraint1}
        # con2 = {'type': 'ineq', 'fun': fc.constraint2}
        con3 = {'type': 'ineq', 'fun': estimation_model.constraint3}
        cons = ([con3])

        p = [con.par_d2, con.par_d4, con.par_u2, con.par_u4]
        # p = [0.2, 0.2,0.4,0.5,0.6,0.5,0.6,0.6,0.6,0.6]
        result1 = minimize(estimation_model.func_estimate_params, p)

        par = result1.x
        estimated_option_price = estimation_model.fun_estimate_d_u(par)
        result_fitted_values = [estimated_option_price[2], estimated_option_price[3], estimated_option_price[0],
                                estimated_option_price[4], estimated_option_price[1]]
        result_fitted_values = pd.DataFrame(result_fitted_values).transpose()
        result_fitted_values.columns = ["Strike Price", "Observed Bid Price", "Fitted Option Price",
                                        "Observed Ask Price", "Observed Option Price"]
        # result_fitted_values.to_csv(r'/Users/shashi.sh/Projects/Personal/fwdproject_7jul/Option_Price_Result.csv')
        estimated_parameters = np.concatenate((result.x, par))
        estimated_parameters = pd.DataFrame(estimated_parameters, index=["Slope", "d2", "d4", "u2", "u4"])
        # estimated_parameters.to_csv(r'/Users/shashi.sh/Projects/Personal/fwdproject_7jul/Estimated_parameters_Result.csv')

        print(estimated_parameters)
        print(result_fitted_values)
