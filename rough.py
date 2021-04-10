full_data = pd.read_csv(io.BytesIO(uploaded['Winddown - 2020 NOV-JAN NIFTY.csv']))
# postMarketTime = ['09:08' , '15:31', '15:32', '15:33']
# full_data = full_data[~full_data['Time'].isin(postMarketTime)]
# Dataset is now stored in a Pandas Dataframe
full_data.head()

full_data['close_previous'] = full_data['close'].shift(1)
full_data.head()

full_data['returns'] = get_returns( full_data['close'], full_data['close_previous'] )
full_data['variance'] = np.square(full_data['returns'])
full_data['gap_gamma_PnL'] = get_gamma_pnl( full_data['open'], full_data['close_previous'] )
full_data['Realised_Var'] = full_data['variance'].rolling( min_periods = min_rolling_periods, window = sliding_window ).sum()

full_data.head()

date_column = full_data['date']
date_unique = get_unique_days(date_column)

windDownTime = get_window_list( sliding_window, Tstart, Tend ) #10 minute default window

# print( date_unique )
# print( windDownTime )

full_data['updatedTime'] = pd.to_datetime(full_data['time'] , format='%H:%M')
# print(df2)

filter_sliding_window_time = full_data["updatedTime"].isin(windDownTime)
filter_date_unique = full_data["date"].isin(date_unique)

filter_data = full_data[filter_sliding_window_time & filter_date_unique]
filter_data.head()

mean_list = get_mean_each_interval(windDownTime, date_unique, filter_data)
mean_list_updated = [0 if math.isnan(x) else x for x in mean_list]
print(mean_list_updated)

wind_down = []
cum_winddown = sum(mean_list_updated)
for mean in mean_list_updated:
  wind_down.append(mean / cum_winddown)

wind_down_updated = [min_winddown if x < 0.00000000001 else x for x in wind_down] #add Min. Winddown for the 1st window
wind_down_window_updated = [ date_convert(x) if 1 else 0 for x in windDownTime] #update date object to time

print(sum(wind_down), sum(wind_down_updated))
# print(wind_down_window_updated)
# print(wind_down_updated)

data = {'range':wind_down_window_updated,
    'winddown':wind_down_updated,
    'old winddown': wind_down}

# Create DataFrame
df0 = pd.DataFrame(data)
print(df0)



#Realised Volatility Calculations

realised_vol_list = [0] #set realised Vol to 0 at trade start time

for i, range in enumerate(wind_down_window_updated):
  if i > 0:
    avg_gamma_pnl_list = []
    total_iterations = n_iterations
    gamma_pnl_list = []
    # print(wind_down_updated[i], wind_down_window_updated[i-1], range)

    while total_iterations > 0:
      total_iterations = total_iterations - 1
      gamma_pnl = 0
      hedge_points = generate_random_hedge_point_adhoc( avg_hedge_per_day, wind_down_updated[i], wind_down_window_updated[i-1], range )

      for j, hp in enumerate(hedge_points):
        base_price_current = 1;
        base_price_previous = 1;
        previous_hedge_time = sub_minute_from_time(range, hp)
        # print(range, previous_hedge_time)

        filter_row_curr = full_data.loc[ ( full_data['updatedTime'] == date_convert_to_obj(range) ) ]
        filter_row_prev = full_data.loc[ ( full_data['updatedTime'] == date_convert_to_obj(previous_hedge_time) ) ]

        if not filter_row_curr.empty:
          base_price_current = filter_row_curr.iloc[0]['close']
          base_price_previous = filter_row_prev.iloc[0]['close']

        # print(base_price_current, base_price_previous, range, hp, sub_minute_from_time(range, hp) )
        gamma_pnl = gamma_pnl + get_gamma_pnl(base_price_current, base_price_previous)
      gamma_pnl_list.append(gamma_pnl)
    # print(gamma_pnl_list)
    avg_gamma_pnl = sum(gamma_pnl_list) / len(gamma_pnl_list)
    # print(range, avg_gamma_pnl)
    realised_vol = get_realised_vol(avg_gamma_pnl, wind_down_updated[i])
    realised_vol_list.append(realised_vol)
    # print(range, avg_gamma_pnl, wind_down_updated[i], realised_vol)
    # print(hedge_points)


data_complete = { 'range':wind_down_window_updated,
        'winddown':wind_down_updated,
        'Realised Vol': realised_vol_list }

# Create DataFrame
df0 = pd.DataFrame(data_complete)
print(df0)


print ("hello world!")
print ("Welcome to python cron job")

conn = pymysql.connect(host=host,
        user=user,
        passwd=passw,
        db=database)


from joyzoursky/python-chromedriver:3.8-alpine3.10-selenium

RUN pip install --upgrade pip

