import datetime

# Dates between which we need historical data
diff = 60
to_date = datetime.datetime.now()
from_date = (to_date - datetime.timedelta(days=diff))

# Interval(minute, day, 3 minute, 5 minute...)
interval = "minute"

slidingWindow = [5, 10, 15, 30, 60]
min_winddown = 0.01
dbDateRange = 10
iterations = 20