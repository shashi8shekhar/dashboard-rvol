print('inside RealisedVol')
import pandas as pd
import numpy as np
import datetime
import math

class RealisedVol:
    def __init__(self, data, tStart, tEnd, sliding_window=5, avg_hedge_per_day=6, iterations=100):
        #print(data, tStart, tEnd, sliding_window, avg_hedge_per_day, iterations)
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
        updated_time = time_obj - datetime.timedelta(minutes = delta)
        return updated_time.time()

    def get_window_list(self):
        time_window = []
        tStart_time_obj = datetime.datetime.strptime(self.tStart, '%H:%M:%S')
        tEnd_time_obj = datetime.datetime.strptime(self.tEnd, '%H:%M:%S')
        sliding_time = tStart_time_obj

        while sliding_time < tEnd_time_obj:
            time_window.append( sliding_time.time() )
            sliding_time = sliding_time + datetime.timedelta(seconds = self.sliding_window * 60)

        time_window.append( tEnd_time_obj.time() )
        return time_window

    def _calculate_rvol(self, wind_down, running_date, prev_close_price):
        self._updateData()
        rvolKey = str(self.sliding_window) + 'min'
        wind_down_Key = 'winddown_' + str(self.sliding_window) + 'min'

        realised_vol_list = []
        winddown_list = []
        ten_min_rvol = []
        thirty_min_rvol = []

        rvol_sq_day = 0
        wind_down_sum_day = 0
        today_rvol = []

        wind_down_window = self.get_window_list()
        #print('inside _calculate_rvol', wind_down_window)

        for (i, range) in enumerate(wind_down_window):
            curr_winddown_dict = [wind_down for wind_down in wind_down if wind_down['range'] == range][0]
            curr_winddown = float(curr_winddown_dict[rvolKey])
            winddown_list.append(curr_winddown)
            #print(curr_winddown)

            if (i == 0):
                filter_row_curr = self.data.loc[self.data['time'] == range]
                # print('filter_row_curr', filter_row_curr)

                base_price_current = 1
                if not filter_row_curr.empty:
                    base_price_current = filter_row_curr.iloc[0]['close']

                # print('base_price_current', base_price_current)

                avg_gamma_pnl =  self.get_gamma_pnl( base_price_current, prev_close_price )
                realised_vol = self.get_realised_vol(avg_gamma_pnl, curr_winddown)

                # print('avg_gamma_pnl', avg_gamma_pnl)
                # print('realised_vol', realised_vol)

                realised_vol_list.append(realised_vol)
                ten_min_rvol.append(realised_vol)
                thirty_min_rvol.append(realised_vol)
                today_rvol.append(realised_vol)
            else:
                avg_gamma_pnl_list = []
                total_iterations = self.iterations
                gamma_pnl_list = []

                while total_iterations > 0:
                    total_iterations = total_iterations - 1
                    gamma_pnl = 0
                    hedge_points = self.generate_random_hedge_point_adhoc(self.avg_hedge_per_day, curr_winddown, wind_down_window[i - 1].strftime("%H:%M:%S"), range.strftime("%H:%M:%S"))

                    for (j, hp) in enumerate(hedge_points):
                        base_price_current = 1
                        base_price_previous = 1
                        previous_hedge_time = self.sub_minute_from_time(range.strftime("%H:%M:%S"), hp)

                        # print(range, previous_hedge_time)

                        filter_row_curr = self.data.loc[self.data['time'] == range]
                        filter_row_prev = self.data.loc[self.data['time'] == previous_hedge_time]

                        if not filter_row_curr.empty:
                            base_price_current = filter_row_curr.iloc[0]['close']
                            base_price_previous = filter_row_prev.iloc[0]['close']

                            # print(base_price_current, base_price_previous, range, hp, self.sub_minute_from_time(range.strftime("%H:%M:%S"), hp) )

                        gamma_pnl = gamma_pnl + self.get_gamma_pnl(base_price_current, base_price_previous)
                    gamma_pnl_list.append(gamma_pnl)

                # print(gamma_pnl_list)

                avg_gamma_pnl = sum(gamma_pnl_list) / len(gamma_pnl_list)

                # print(range, avg_gamma_pnl)

                realised_vol = self.get_realised_vol(avg_gamma_pnl, curr_winddown)
                realised_vol_list.append(realised_vol)

                # 10 minute Realized Vol calculation
                if( i % 2 == 0 ):
                    itr = -2
                    rvol_sq = 0
                    wind_down_sum = 0
                    while(itr < 0):
                        rvol_sq += (realised_vol_list[itr]**2) * winddown_list[itr]
                        wind_down_sum += winddown_list[itr]
                        # print(itr, rvol_sq, wind_down_sum)
                        itr += 1
                    n_min_window_rvol = np.sqrt(rvol_sq / wind_down_sum)
                    ten_min_rvol.append(n_min_window_rvol)
                else:
                    ten_min_rvol.append(ten_min_rvol[-1])

                # print('ten_min_rvol', i%2, ten_min_rvol)

                # 30 minute Realized Vol calculation
                if (i % 6 == 0):
                    itr = -6
                    rvol_sq = 0
                    wind_down_sum = 0
                    while (itr < 0):
                        rvol_sq += (realised_vol_list[itr] ** 2) * winddown_list[itr]
                        wind_down_sum += winddown_list[itr]
                        itr += 1
                        # print(itr, rvol_sq, wind_down_sum)
                    n_min_window_rvol = np.sqrt(rvol_sq / wind_down_sum)
                    thirty_min_rvol.append(n_min_window_rvol)
                else:
                    thirty_min_rvol.append(thirty_min_rvol[-1])

                # print('thirty_min_rvol', i % 6, thirty_min_rvol)

                # today minute Realized Vol calculation
                rvol_sq_day += (realised_vol ** 2) * curr_winddown
                wind_down_sum_day += curr_winddown
                today_rvol.append( np.sqrt(rvol_sq_day / wind_down_sum_day) )

                # print(range, avg_gamma_pnl, curr_winddown, realised_vol)
                # print(hedge_points)

        dateTimeList = [datetime.datetime.combine(running_date, range) for range in wind_down_window ]

        #print('dateTimeList ', dateTimeList)
        data = { 'dateTime': dateTimeList,
                 wind_down_Key: winddown_list,
                 rvolKey: realised_vol_list,
                 '10min': ten_min_rvol,
                 '30min': thirty_min_rvol,
                 'today': today_rvol }
        # data.update({rvolKey: realised_vol_list})

        # Create DataFrame
        df = pd.DataFrame(data)

        #filter 0 values
        rslt_df = df.loc[df[rvolKey] > 0]

        # print('rslt_df',  rslt_df)

        return rslt_df

