import pandas as pd
import numpy as np
import datetime
import math

class RealisedVol:
    def __init__(self, data, tStart, tEnd, sliding_window=5, minWinddown=0.1, avg_hedge_per_day=6, iterations=100):
        self.min_winddown = minWinddown #used for 1st window where difference is close to zero.
        self.avg_hedge_per_day = avg_hedge_per_day
        self.iterations = iterations
        self.sliding_window = sliding_window # n minutes sliding window
        self.min_rolling_periods = sliding_window #(0, sliding_window]
        self.tStart = tStart #market start time
        self.tEnd = tEnd #market end time
        self.data = data

    def exp_pdf( x, lam ):
        return lam * np.exp(-lam * x)

    def get_total_seconds_in_period(tStart, tEnd):
        tEnd_dateTime = datetime.datetime.strptime(tEnd, '%H:%M')
        tStart_dateTime = datetime.datetime.strptime(tStart, '%H:%M')

        difference = (tEnd_dateTime - tStart_dateTime)
        # difference = datetime.datetime.strptime(tEnd, '%H:%M') - datetime.datetime.strptime(tStart, '%H:%M')
        # (b-a).total_seconds()

        return difference.total_seconds()

    def get_total_minutes_in_period(tStart, tEnd):
        return int(get_total_seconds_in_period(tStart, tEnd) / 60)

    def generate_random_hedge_point( avgNoOfHedgePerDay, winddown, tStart, tEnd ):
        expected_hedges_in_period = avgNoOfHedgePerDay * winddown
        total_seconds_in_period = get_total_seconds_in_period(tStart, tEnd)
        expected_hedges_per_second = expected_hedges_in_period / total_seconds_in_period

        hedge_points = []
        current_second = 0
        # print(expected_hedges_in_period, total_seconds_in_period, expected_hedges_per_second)

        while current_second < total_seconds_in_period:
            hedge_points.append(current_second)
            current_second = current_second + exp_pdf(expected_hedges_per_second, 1)

        # print(hedge_points)
        return hedge_points

    def generate_random_hedge_point_adhoc( avgNoOfHedgePerDay, winddown, tStart, tEnd ):
        expected_hedges_in_period = avgNoOfHedgePerDay * winddown
        total_minutes_in_period = get_total_minutes_in_period(tStart, tEnd)
        expected_hedges_per_minute = expected_hedges_in_period / total_minutes_in_period

        hedge_points = []
        current_minute = 0
        # print(expected_hedges_in_period, total_minutes_in_period, expected_hedges_per_minute)

        while current_minute < total_minutes_in_period:
            hedge_points.append(int(current_minute))
            current_minute = current_minute + exp_pdf(expected_hedges_per_minute, 1)

        # print(hedge_points)
        return hedge_points

    def get_realised_vol( avg_gamma_pnl, winddown ):
        return np.sqrt( 2 * avg_gamma_pnl ) / np.sqrt( winddown / 256 )

    def get_returns(self, current, previous ):
        return np.log( current / previous )

    def get_gamma_pnl(self, base_price_current, base_price_previous ):
        return - (np.log( base_price_current / base_price_previous )) + base_price_current / base_price_previous - 1

    def _calculate_rvol(self, range):
        realised_vol_list = [0] #set realised Vol to 0 at trade start time

        avg_gamma_pnl_list = []
        total_iterations = self.iterations
        gamma_pnl_list = []

        while total_iterations > 0:
            total_iterations = total_iterations - 1
            gamma_pnl = 0
            hedge_points = generate_random_hedge_point_adhoc( avg_hedge_per_day, wind_down_updated[i], wind_down_window_updated[i-1], range )

            for j, hp in enumerate(hedge_points):
                base_price_current = 1;
                base_price_previous = 1;
                previous_hedge_time = sub_minute_from_time(range, hp)

                filter_row_curr = full_data.loc[ ( full_data['time'] == range ) ]
                filter_row_prev = full_data.loc[ ( full_data['time'] == previous_hedge_time ) ]

                if not filter_row_curr.empty:
                    base_price_current = filter_row_curr.iloc[0]['close']
                    base_price_previous = filter_row_prev.iloc[0]['close']

                gamma_pnl = gamma_pnl + get_gamma_pnl(base_price_current, base_price_previous)
            gamma_pnl_list.append(gamma_pnl)
        avg_gamma_pnl = sum(gamma_pnl_list) / len(gamma_pnl_list)
        realised_vol = self.get_realised_vol(avg_gamma_pnl, wind_down)

        data_complete = { 'range':range,
                'winddown':wind_down,
                'Realised Vol': realised_vol }

        # Create DataFrame
        df0 = pd.DataFrame(data_complete)
        print(df0)

        return df0;