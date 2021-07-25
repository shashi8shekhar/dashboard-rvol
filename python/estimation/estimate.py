import math
import numpy as np
import pandas as pd
from scipy.stats import norm
import sympy as sp
import scipy.optimize as spo
from scipy.optimize import minimize
from datetime import datetime
from nsepython import *
import Constants as con


class Estimate:
    def __init__(self, win_odds=0.52):
        self.win_odds = win_odds

    @staticmethod
    def get_constants(underlying_price, exercise_price, years_till_expiry, interest, dividend, option_type):
        """

        :rtype: object
        """
        c = np.zeros(5)
        c[0] = (math.log(underlying_price / exercise_price) + (interest - dividend) * years_till_expiry) / math.sqrt(
            years_till_expiry)
        c[1] = 0.5 * math.sqrt(years_till_expiry)
        c[2] = math.sqrt(years_till_expiry)
        c[3] = math.exp(-dividend * years_till_expiry) * underlying_price
        c[4] = math.exp(-interest * years_till_expiry) * exercise_price
        if option_type == 'PE':
            c[0] = -c[0]
            c[1] = -c[1]
            c[2] = -c[2]
            c[3] = -c[3]
            c[4] = -c[4]
        return c

    @staticmethod
    def cost_function(c, volatility):
        d_one = c[0] / volatility + c[1] * volatility
        d_two = d_one - c[2] * volatility
        d_one_cdf = norm.cdf(d_one)
        d_two_cdf = norm.cdf(d_two)
        return c[3] * d_one_cdf - c[4] * d_two_cdf

    @staticmethod
    def get_x(F, K):
        x = math.log(F / K)
        return x

    def get_base_vol(self, atmvol, sl, F, K):
        x = self.get_x(F, K)
        base_vol = atmvol * (1 - (sl * x) + (sl * x ** 3 / 12))
        return base_vol

    def implied_volatility(self, underlying_price, exercise_price, years_till_expiry, interest, target_price, dividend,
                           opt_type):
        try:
            high_vol = 1000
            low_vol = 0.0001
            mid_vol = (low_vol + high_vol) / 2

            c = self.get_constants(underlying_price, exercise_price, years_till_expiry, interest, dividend, opt_type)
            while (high_vol - low_vol) > 0.001:
                mid_vol = (low_vol + high_vol) / 2
                cost = self.cost_function(c, mid_vol)
                if cost > target_price:
                    high_vol = mid_vol
                else:
                    low_vol = mid_vol
            return mid_vol
        except Exception as e:
            print('#' * 50, "Implied Vol Error!!!", '#' * 50)
            print(e)

    def func_estimate_slope(self, sl):
        opt_val = []

        atmvol = self.implied_volatility(F, K_atm, T, interest=0.03, target_price=atm_t_p, dividend=0, opt_type="PE")
        i = min(range(len(Tot_K)), key=lambda i: abs(Tot_K[i] - K_atm))
        K = Tot_K[i - 4:i + 5]
        target_price = Tot_target_price[i - 4:i + 5]
        opt_type = Tot_opt_type[i - 4:i + 5]
        for i in range(0, len(K)):
            x = get_x(F, K[i])
            base_vol = atmvol * (1 - (sl * x) + (sl * x ** 3 / 12))
            c = self.get_constants(F, K[i], T, interest=0.03, dividend=0, option_type=opt_type[i])
            opt_value = self.cost_function(c, base_vol)
            opt_val.append(opt_value)
        # return opt_val

        error = np.subtract(target_price, opt_val)
        return np.sum(error ** 2)

    def fun_estimate_d_u(self, params):
        result = minimize(self.func_estimate_slope, [0])
        sl = result.x[0]
        d2 = params[0]
        d4 = params[1]
        u2 = params[2]
        u4 = params[3]

        atmvol = self.implied_volatility(F, K_atm, T, interest=0.03, target_price=atm_t_p, dividend=0, opt_type="PE")

        i = min(range(len(Tot_K)), key=lambda i: abs(Tot_K[i] - K_atm))
        K = Tot_K[i - 6:i + 7]
        target_price = Tot_target_price[i - 6:i + 7]
        Target_bid_price = Target_Bid_Price[i - 6:i + 7]
        Target_ask_price = Target_Ask_Price[i - 6:i + 7]
        opt_type = Tot_opt_type[i - 6:i + 7]
        opt_value = []
        # p_d_d = []
        # p_d_u = []
        # est_sl = minimize(func_estimate_slope, [0])

        for i in range(0, round(len(K) / 2) + 1):
            base_vol = self.get_base_vol(atmvol, sl, F, K[i])
            x = (math.log(F / K[i]) + (base_vol ** 2 * T * 0.5)) / (base_vol * math.sqrt(T))
            # x = get_x(F, K[i])
            phi_x = norm.cdf(x)
            C2, C4, C6, C8, C10 = 1, 1, 1, 1, 1

            pd2 = C2 * K[i] * base_vol * math.sqrt(T) * phi_x * (x ** 2) * d2
            pd4 = C4 * K[i] * base_vol * math.sqrt(T) * phi_x * (x ** 4) * d4
            # pd6 = C6 * K[i] *  base_vol * math.sqrt(T) * phi_x * (x**6) *d6
            # pd8 = C8 * K[i] *  base_vol * math.sqrt(T) * phi_x * (x**8) *d8
            # pd10 = C10 * K[i] *  base_vol * math.sqrt(T) * phi_x * (x**10) *d10
            # pd = pd2 + pd4 + pd6 + pd8 + pd10
            pd = pd2 + pd4
            c = self.get_constants(F, K[i], T, interest=0.03, dividend=0, option_type=opt_type[i])
            opt_val_bs = self.cost_function(c, base_vol)
            opt_val = opt_val_bs + pd
            opt_value.append(opt_val)

        for i in range(round(len(K) / 2) + 1, len(K)):
            base_vol = self.get_base_vol(atmvol, sl, F, K[i])
            x = (math.log(F / K[i]) + (base_vol ** 2 * T * 0.5)) / (base_vol * math.sqrt(T))
            # x = get_x(F, K[i])
            phi_x = norm.cdf(x)
            C2, C4, C6, C8, C10 = 10, 1, 10, 1, 1

            pu2 = C2 * K[i] * base_vol * math.sqrt(T) * phi_x * (x ** 2) * u2
            pu4 = C4 * K[i] * base_vol * math.sqrt(T) * phi_x * (x ** 4) * u4
            # pu6 = C6 * K[i] *  base_vol * math.sqrt(T) * phi_x * (x**6) *u6
            # pu8 = C8 * K[i] *  base_vol * math.sqrt(T) * phi_x * (x**8) *u8
            # pu10 = C10 * K[i] *  base_vol * math.sqrt(T) * phi_x * (x**10) *u10
            # pd = pu2 + pu4 + pu6 + pu8 + pu10
            pd = pu2 + pu4
            c = self.get_constants(F, K[i], T, interest=0.03, dividend=0, option_type=opt_type[i])
            opt_val_bs = self.cost_function(c, base_vol)
            opt_val = opt_val_bs + pd
            opt_value.append(opt_val)

        return opt_value, target_price, K, Target_bid_price, Target_ask_price

    def func_estimate_params(self, params):
        value = self.fun_estimate_d_u(params)
        opt_value = value[0]
        target_price = value[1]
        error = np.subtract(target_price, opt_value)
        return np.sum(error ** 2)

    def constraint3(self, params):
        value = self.fun_estimate_d_u(params)
        opt_value = value[0]
        return opt_value

    @staticmethod
    def get_data(ticker, exp_dt):
        opt_type = np.array(["PE", "CE"])

        oi_data, ltp, crontime = oi_chain_builder(ticker, exp_dt)  #### e.g. ticker = "NIFTY"; exp-dt = "29-Jul-2021"
        F = nse_quote_ltp(ticker, "latest", "Fut")

        data_K = list(oi_data["Strike Price"])
        K_atm = int(min(data_K, key=lambda x: abs(x - F)))

        K_b = list(range(K_atm - 4000, K_atm + 4000, 200))  #####Create benchmark strike################
        K = [element for element in data_K if element in K_b]

        data_sub = oi_data[oi_data["Strike Price"].isin(K)]
        data_sub = data_sub.reset_index(drop=True)

        PE_avg_price = list((data_sub["PUTS_Bid Price"] + data_sub["PUTS_Ask Price"]) * 0.5)
        CE_avg_price = list((data_sub["CALLS_Bid Price"] + data_sub["CALLS_Ask Price"]) * 0.5)

        ind = [i for i, x in enumerate(data_sub["Strike Price"]) if x == K_atm]
        Target_Price = PE_avg_price[0:ind[0] + 1] + CE_avg_price[ind[0] + 1:len(CE_avg_price)]
        atm_t_p = Target_Price[ind[0]]

        Target_Bid_Price = np.r_[np.array(data_sub.loc[0:ind[0], ["PUTS_Bid Price"]]), np.array(
            data_sub.loc[ind[0] + 1:len(CE_avg_price), ["CALLS_Bid Price"]])]
        Target_Ask_Price = np.r_[np.array(data_sub.loc[0:ind[0], ["PUTS_Ask Price"]]), np.array(
            data_sub.loc[ind[0] + 1:len(CE_avg_price), ["CALLS_Ask Price"]])]

        Tot_opt_type = np.repeat(opt_type, [ind[0] + 1, (len(Target_Price) - ind[0] - 1)], axis=0)

        T = ((datetime.datetime.strptime(exp_dt, "%d-%b-%Y").date() - datetime.datetime.today().date()).days) / 365

        return F, T, atm_t_p, K_atm, K, Tot_opt_type, Target_Price, Target_Bid_Price, Target_Ask_Price

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
                return


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
                i_vol_table_key = 'est-' + str(expiry) + '-' + str(instrument_token)

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
                time_to_expiry = self.count_time(constants.to_date, expiry, config['t_end'], constants.minutes_in_a_yr)

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
        self.runSchedulerOnConfig(kiteObj, configuration_obj_data, instruments_details_obj_data, constants)





    F, T, atm_t_p, K_atm, Tot_K, Tot_opt_type, Tot_target_price, Target_Bid_Price, Target_Ask_Price = self.get_data