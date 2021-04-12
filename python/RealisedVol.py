import pandas as pd
import numpy as np
import datetime
import math

class RealisedVol:
    def __init__(self, data, tStart, tEnd, sliding_window=5, avg_hedge_per_day=6, iterations=100):
        self.data = data
        self.avg_hedge_per_day = avg_hedge_per_day
        self.iterations = iterations
        self.sliding_window = sliding_window # n minutes sliding window
        self.min_rolling_periods = sliding_window #(0, sliding_window]
        self.tStart = tStart #market start time
        self.tEnd = tEnd #market end time
        self.data = data

    def exp_pdf( self, x, lam ):
        return lam * np.exp(-lam * x)

    def get_total_seconds_in_period(self, tStart, tEnd):

        tEnd_dateTime = datetime.datetime.strptime(tEnd, '%H:%M:%S')
        tStart_dateTime = datetime.datetime.strptime(tStart, '%H:%M:%S')
        difference = (tEnd_dateTime - tStart_dateTime)

        return difference.total_seconds()

    def get_total_minutes_in_period(self, tStart, tEnd):
        return int(self.get_total_seconds_in_period(tStart, tEnd) / 60)

    def generate_random_hedge_point_adhoc(self, avgNoOfHedgePerDay, winddown, tStart, tEnd ):
        expected_hedges_in_period = avgNoOfHedgePerDay * winddown
        total_minutes_in_period = self.get_total_minutes_in_period(tStart, tEnd)
        expected_hedges_per_minute = expected_hedges_in_period / total_minutes_in_period

        hedge_points = []
        current_minute = 0

        while current_minute < total_minutes_in_period:
            hedge_points.append(int(current_minute))
            current_minute = current_minute + self.exp_pdf(expected_hedges_per_minute, 1)

        return hedge_points

    def get_realised_vol(self, avg_gamma_pnl, winddown ):
        return np.sqrt( 2 * avg_gamma_pnl ) / np.sqrt( winddown / 256 )

    def get_returns(self, current, previous ):
        return np.log( current / previous )

    def get_gamma_pnl(self, base_price_current, base_price_previous ):
        return - (np.log( base_price_current / base_price_previous )) + base_price_current / base_price_previous - 1

    def _updateData(self):
        self.data['day'] = pd.to_datetime(self.data['date'], format='%Y:%M:%D').dt.date
        self.data['time'] = pd.to_datetime(self.data['date'], format='%Y:%M:%D').dt.time

    def sub_minute_from_time(self, time, delta):
        time_obj = datetime.datetime.strptime(time, '%H:%M:%S')
        updated_time = timeobj - datetime.timedelta(minutes = delta)
        return updated_time.time()

    def _calculate_rvol(wind_down_window, wind_down):
        realised_vol_list = [0]

        for (i, range) in enumerate(wind_down_window):
            if i > 0:
                avg_gamma_pnl_list = []
                total_iterations = self.iterations
                gamma_pnl_list = []

                while total_iterations > 0:
                    total_iterations = total_iterations - 1
                    gamma_pnl = 0
                    hedge_points = self.generate_random_hedge_point_adhoc(self.avg_hedge_per_day, wind_down[i], wind_down_window[i - 1], range)

                    for (j, hp) in enumerate(hedge_points):
                        base_price_current = 1
                        base_price_previous = 1
                        previous_hedge_time = self.sub_minute_from_time(range, hp)

                        # print(range, previous_hedge_time)

                        filter_row_curr = self.data.loc[self.data['time'] == range]
                        filter_row_prev = self.data.loc[self.data['time'] == previous_hedge_time]

                        if not filter_row_curr.empty:
                            base_price_current = filter_row_curr.iloc[0]['close']
                            base_price_previous = filter_row_prev.iloc[0]['close']

                            # print(base_price_current, base_price_previous, range, hp, self.sub_minute_from_time(range, hp) )

                        gamma_pnl = gamma_pnl + self.get_gamma_pnl(base_price_current, base_price_previous)
                    gamma_pnl_list.append(gamma_pnl)

                # print(gamma_pnl_list)

                avg_gamma_pnl = sum(gamma_pnl_list) / len(gamma_pnl_list)

                # print(range, avg_gamma_pnl)

                realised_vol = self.get_realised_vol(avg_gamma_pnl, wind_down[i])
                realised_vol_list.append(realised_vol)

                # print(range, avg_gamma_pnl, wind_down[i], realised_vol)
                # print(hedge_points)

        rvolKey = str(self.sliding_window) + 'min'

        data = { 'range': wind_down_window }
        data.update({rvolKey: realised_vol_list})

        # Create DataFrame
        df = pd.DataFrame(data)
        print(df)
        return df
