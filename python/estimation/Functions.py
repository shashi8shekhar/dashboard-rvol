import math
import numpy as np
import pandas as pd
from scipy.stats import norm
import sympy as sp
import scipy.optimize as spo
from scipy.optimize import minimize
from datetime import datetime
from nsepython import *
import estimation.Constants as con


####Compte Black 76 model###############

class EstimationModel:
    def __init__(self, kiteObj, full_detail, last_price_future, last_trade_time, atm_strike, expiry, strike_list,
                 tradingsymbol, atm_df, put_otm_df, call_otm_df, current_expiry_instruments_df):
        # print(last_price_future, last_trade_time, atm_strike, expiry, strike_list, tradingsymbol, atm_df, put_otm_df, call_otm_df)
        self.kite = kiteObj
        self.data = full_detail
        self.ltp_future = last_price_future
        self.ltt = last_trade_time
        self.atm_strike = atm_strike
        self.expiry = expiry
        self.strike_list = strike_list
        self.ticker = tradingsymbol
        self.atm_df = atm_df
        self.put_otm_df = put_otm_df
        self.call_otm_df = call_otm_df
        self.current_expiry_instruments_df = current_expiry_instruments_df
        self.T = None
        self.F = last_price_future
        self.atm_t_p = None
        self.K_atm = None
        self.Tot_K = None
        self.Tot_opt_type = None
        self.Tot_target_price = None
        self.Target_Bid_Price = None
        self.Target_Ask_Price = None

    @staticmethod
    def get_constants(underlying_price, exercise_price, years_till_expiry, interest, dividend, option_type):
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

    def implied_volatility(self, underlying_price, exercise_price, years_till_expiry, interest, target_price, dividend, opt_type):
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

    @staticmethod
    def get_x(F, K):
        x = math.log(F / K)
        return x

    def get_base_vol(self, atmvol, sl, F, K):
        x = self.get_x(F, K)
        base_vol = atmvol * (1 - (sl * x) + (sl * x ** 3 / 12))
        return base_vol

    # def func_estimate_slope( F, K, sl, T, atm_t_p, target_price):

    @staticmethod
    def get_depth_price(tokenData, type):
        if tokenData['depth'][type][0]['price'] == 0:
            return tokenData['last_price']
        else:
            return tokenData['depth'][type][0]['price']

    @staticmethod
    def get_avg_bid_ask(tokenData):
        if tokenData['depth']['buy'][0]['price'] == 0:
            return tokenData['last_price']
        else:
            return (tokenData['depth']['buy'][0]['price'] + tokenData['depth']['sell'][0]['price']) / 2

    def get_data(self):
        exp_dt = self.expiry
        ticker = self.ticker

        F = self.ltp_future
        data_K = self.strike_list

        K_atm = float(min(data_K, key=lambda x: abs(x - F)))

        float_range_array = np.arange(K_atm - 4000, K_atm + 4000, 200.00)
        K_b = list(float_range_array) #####Create benchmark strike################

        K = [float(element) for element in data_K if element in K_b]
        # print("Strikes===========", K)

        contract_df_pe = self.current_expiry_instruments_df.loc[(self.current_expiry_instruments_df['type'] == 'PE')]
        filtered_df_pe = contract_df_pe.loc[contract_df_pe.strike.isin(K)]
        filtered_df_pe.sort_values(by=['strike'])

        contract_df_ce = self.current_expiry_instruments_df.loc[(self.current_expiry_instruments_df['type'] == 'CE')]
        filtered_df_ce = contract_df_ce.loc[contract_df_ce.strike.isin(K)]
        filtered_df_ce.sort_values(by=['strike'])

        K = (pd.to_numeric(filtered_df_ce["strike"])).tolist()
        # print(K)

        PE_avg_price = [self.get_avg_bid_ask(self.data[str(x)]) for x in filtered_df_pe['token']]
        CE_avg_price = [self.get_avg_bid_ask(self.data[str(x)]) for x in filtered_df_ce['token']]

        ind = [i for i, x in enumerate(filtered_df_ce["strike"]) if x == K_atm]
        # print('ind =====', ind)
        # print(K_atm)

        Target_Price = PE_avg_price[0:ind[0] + 1] + CE_avg_price[ind[0] + 1:len(CE_avg_price)]

        def get_target_price(type, option):
            df = filtered_df_pe if option == 'pe' else filtered_df_ce
            return [[self.get_depth_price(self.data[str(x)], type)] for i, x in enumerate(df["token"]) if
                    (option == 'pe' and i <= ind[0]) or (option == 'ce' and i > ind[0])]

        Target_Bid_Price = np.r_[get_target_price('buy', 'pe'), get_target_price('buy', 'ce')]
        Target_Ask_Price = np.r_[get_target_price('sell', 'pe'), get_target_price('sell', 'ce')]

        # print(Target_Bid_Price)
        # print(Target_Ask_Price)

        atm_t_p = Target_Price[ind[0]]
        opt_type = np.array(["PE", "CE"])

        # print('TEST--------')
        # print(Target_Price, ind, (len(Target_Price) - ind[0] - 1))

        Tot_opt_type = np.repeat(opt_type, [ind[0] + 1, (len(Target_Price) - ind[0] - 1)], axis=0)
        T = (datetime.datetime.strptime(exp_dt, "%Y-%m-%d").date() - datetime.datetime.today().date()).days / 365

        self.T = T
        self.F = F
        self.atm_t_p = atm_t_p
        self.K_atm = K_atm
        self.Tot_K = K
        self.Tot_opt_type = Tot_opt_type
        self.Tot_target_price = Target_Price
        self.Target_Bid_Price = Target_Bid_Price
        self.Target_Ask_Price = Target_Ask_Price

        # print(F, T, atm_t_p, K_atm, K, Tot_opt_type, Target_Price);
        return F, T, atm_t_p, K_atm, K, Tot_opt_type, Target_Price, Target_Bid_Price, Target_Ask_Price

    def func_estimate_slope(self, sl):
        opt_val = []

        try:
            atmvol = self.implied_volatility(self.F, self.K_atm, self.T, interest=0.03, target_price=self.atm_t_p, dividend=0, opt_type="PE")
            i = min(range(len(self.Tot_K)), key=lambda i: abs(self.Tot_K[i] - self.K_atm))
            K = self.Tot_K[i - 4:i + 5]
            target_price = self.Tot_target_price[i - 4:i + 5]
            opt_type = self.Tot_opt_type[i - 4:i + 5]
            for i in range(0, len(K)):
                x = self.get_x(self.F, K[i])
                base_vol = atmvol * (1 - (sl * x) + (sl * x ** 3 / 12))
                c = self.get_constants(self.F, K[i], self.T, interest=0.03, dividend=0, option_type=opt_type[i])
                opt_value = self.cost_function(c, base_vol)
                opt_val.append(opt_value)
            # return opt_val

            error = np.subtract(target_price, opt_val)
            return np.sum(error ** 2)
        except Exception as e:
            print('#' * 50, "func_estimate_slope Error!!!", '#' * 50)
            print(e)
            return 0

    def fun_estimate_d_u(self, params):
        try:
            result = minimize(self.func_estimate_slope, [0])
            sl = result.x[0]
            d2 = params[0]
            d4 = params[1]
            u2 = params[2]
            u4 = params[3]

            # d2 = params[0]
            # d4 = params[1]
            # d6 = params[2]
            # d8 = params[3]
            # d10 = params[4]
            # u2 = params[5]
            # u4 = params[6]
            # u6 = params[7]
            # u8 = params[8]
            # u10 = params[9]
            # sl = params[4]
            # F, T, atm_t_p, K_atm, Tot_K, Tot_opt_type, Tot_target_price, Target_Bid_Price, Target_Ask_Price = get_data("BANKNIFTY", "29-Jul-2021")

            # F, T, atm_t_p, K_atm, Tot_K, Tot_opt_type, Tot_target_price, Target_Bid_Price, Target_Ask_Price = get_data(con.Ticker, con.exp_dt)

            atmvol = self.implied_volatility(self.F, self.K_atm, self.T, interest=0.03, target_price=self.atm_t_p, dividend=0, opt_type="PE")

            i = min(range(len(self.Tot_K)), key=lambda i: abs(self.Tot_K[i] - self.K_atm))
            K = self.Tot_K[i - 6:i + 7]
            target_price = self.Tot_target_price[i - 6:i + 7]
            Target_bid_price = self.Target_Bid_Price[i - 6:i + 7]
            Target_ask_price = self.Target_Ask_Price[i - 6:i + 7]
            opt_type = self.Tot_opt_type[i - 6:i + 7]
            # print(self.Tot_opt_type)
            # print(opt_type, i)
            opt_value = []
            T = self.T
            F = self.F
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
                # print(opt_type[i])
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
        except Exception as E:
            print('#' * 50, "fun_estimate_d_u Error!!!", '#' * 50)
            print(E)

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

    def call_vol_est(self):
        print(self)
        result = minimize(self.func_estimate_slope, con.par_slope)
        # con1 = {'type': 'ineq', 'fun': fc.constraint1}
        # con2 = {'type': 'ineq', 'fun': fc.constraint2}
        con3 = {'type': 'ineq', 'fun': self.constraint3}
        cons = ([con3])

        p = [con.par_d2, con.par_d4, con.par_u2, con.par_u4]
        # p = [0.2, 0.2,0.4,0.5,0.6,0.5,0.6,0.6,0.6,0.6]
        result1 = minimize(self.func_estimate_params, p)

        par = result1.x
        estimated_option_price = self.fun_estimate_d_u(par)
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
