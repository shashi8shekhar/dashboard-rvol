import pandas as pd
import numpy as np
import datetime
import math

class Winddown:
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

    def get_returns(self, current, previous ):
        return np.log( current / previous )

    def get_gamma_pnl(self, base_price_current, base_price_previous ):
        return - (np.log( base_price_current / base_price_previous )) + base_price_current / base_price_previous - 1

    def get_realised_vol( avg_gamma_pnl, winddown ):
        return np.sqrt( 2 * avg_gamma_pnl ) / np.sqrt( winddown / 256 )

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

    def get_unique_days(self, date ):
        return np.unique(date)

    def date_convert(date_to_convert):
        return str( date_to_convert.time() )[0:5]
        # return datetime.datetime.strptime(date_to_convert, '%H:%M')

    def sub_minute_from_time(time, delta):
        time_obj = datetime.datetime.strptime(time, '%H:%M')
        return date_convert(time_obj - datetime.timedelta(minutes = delta))

    def date_convert_to_obj(date_to_convert):
        return datetime.datetime.strptime(date_to_convert, '%H:%M')

    def _getDay(date):
        return datetime.datetime.strptime(date_to_convert, '%H:%M')

    def _getTime(date):
        return datetime.datetime.strptime(date_to_convert, '%H:%M')

    def get_mean_each_interval(self, window_list, date_list, data_frame):
        mean_list = []
        for range in window_list:
            cum_sum = 0
            for date in date_list:
                filterRow = self.data.loc[ ( self.data['day'] == date ) & ( self.data['time'] == range ) ]
                if not filterRow.empty:
                    cum_sum = cum_sum + filterRow.iloc[0]['Realised_Var']
            mean_list.append( (1/date_list.size) * cum_sum )
        return mean_list

    def _updateData(self):
        self.data['close_previous'] = self.data['close'].shift(1)
        self.data['returns'] = self.get_returns( self.data['close'], self.data['close_previous'] )
        self.data['variance'] = np.square(self.data['returns'])
        self.data['gap_gamma_PnL'] = self.get_gamma_pnl( self.data['open'], self.data['close_previous'] )
        self.data['Realised_Var'] = self.data['variance'].rolling( min_periods = self.min_rolling_periods, window = self.sliding_window ).sum()
        self.data['day'] = pd.to_datetime(self.data['date'], format='%Y:%M:%D').dt.date
        self.data['time'] = pd.to_datetime(self.data['date'], format='%Y:%M:%D').dt.time

    def _calculate_winddown(self):
        self._updateData()

        date_column = self.data['day']
        date_unique = self.get_unique_days(date_column)

        windDownTime = self.get_window_list() #10 minute default window

        filter_sliding_window_time = self.data["time"].isin(windDownTime)
        filter_date_unique = self.data["day"].isin(date_unique)

        filter_data = self.data[filter_sliding_window_time & filter_date_unique]

        mean_list = self.get_mean_each_interval(windDownTime, date_unique, filter_data)
        mean_list_updated = [0 if math.isnan(x) else x for x in mean_list]

        wind_down = []
        cum_winddown = sum(mean_list_updated)

        for mean in mean_list_updated:
            wind_down.append(mean / cum_winddown)

        wind_down_updated = [self.min_winddown if x < 0.00000000001 else x for x in wind_down] #add Min. Winddown for the 1st window

        data = {'range':windDownTime,
            'winddown': wind_down}

        # Create DataFrame
        df = pd.DataFrame(data)
        df = df.iloc[1:]

        #print(self.sliding_window)
        #print(df)

        return df;

############################