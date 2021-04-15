import datetime
import pytz

UTC = pytz.utc
IST = pytz.timezone('Asia/Kolkata')

# Dates between which we need historical data
diff = 60
diff_rvol = 5
to_date = datetime.datetime.now(IST)
from_date = (to_date - datetime.timedelta(days=diff)).replace(hour=12)
from_date_rvol = (to_date - datetime.timedelta(days=diff_rvol)).replace(hour=4)

# Interval(minute, day, 3 minute, 5 minute...)
interval = "minute"
interval_rvol = 'minute'

#slidingWindow = [5, 10, 15, 30, 60]
slidingWindow = [5]
min_winddown = 0.04
dbDateRange = 10
iterations = 20
