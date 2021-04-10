from dataPipeline.login.kite import kite
from sql.engine import engine

import datetime
import pandas as pd
from Winddown import Winddown

# Instrument token of RELIANCE
instrument_token = "738561"

# Dates between which we need historical data
diff = 6
to_date = datetime.datetime.now()
from_date = (to_date - datetime.timedelta(days=diff))

# Interval(minute, day, 3 minute, 5 minute...)
interval = "minute"

#winddown calc. parameters
tStart = '09:16:00'
tEnd = '15:30:00'
slidingWindow = 5
min_winddown = 0.01

def start(instrument_token, from_date, to_date, interval, tStart, tEnd, slidingWindow, min_winddown):

    # Gets historical data from Kite Connect
    def get_historical_data(instrument_token, from_date, to_date, interval):
	    return kite.historical_data(instrument_token, from_date, to_date, interval)

    records = get_historical_data(instrument_token, from_date, to_date, interval)

    records_df = pd.DataFrame(records)
    #print(records_df.head())

    winddownObj = Winddown(records_df, tStart, tEnd, slidingWindow, min_winddown)
    return winddownObj._calculate_winddown()

winddown_data = {}

winddown_data[slidingWindow] = start(instrument_token, from_date, to_date, interval, tStart, tEnd, slidingWindow, min_winddown)
winddown_data[10] = start(instrument_token, from_date, to_date, interval, tStart, tEnd, 10, min_winddown)
winddown_data[15] = start(instrument_token, from_date, to_date, interval, tStart, tEnd, 15, min_winddown)
winddown_data[30] = start(instrument_token, from_date, to_date, interval, tStart, tEnd, 30, min_winddown)

print(winddown_data)
winddown_data[10].to_sql('winddown_10', engine)
