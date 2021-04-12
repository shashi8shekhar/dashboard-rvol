import datetime

# Dates between which we need historical data
diff = 60
diff_rvol = 10
to_date = datetime.datetime.now()
from_date = (to_date - datetime.timedelta(days=diff))
from_date_rvol = (to_date - datetime.timedelta(days=diff_rvol))

# Interval(minute, day, 3 minute, 5 minute...)
interval = "minute"
interval_rvol = 'minute'

slidingWindow = [5, 10, 15, 30, 60]
min_winddown = 0.04
dbDateRange = 10
iterations = 20