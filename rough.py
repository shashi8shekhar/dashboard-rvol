
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