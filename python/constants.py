print('constants')
import datetime
import pytz

UTC = pytz.utc
IST = pytz.timezone('Asia/Kolkata')

# Dates between which we need historical data
diff = 60
diff_rvol = 50
diff_ivol = 0
days_per_year = 256
secs_per_year = days_per_year * 24 * 3600
to_date = datetime.datetime.now(IST)
from_date = (to_date - datetime.timedelta(days=diff)).replace(hour=4)
from_date_rvol = (to_date - datetime.timedelta(days=diff_rvol)).replace(hour=4)
from_date_ivol = (to_date - datetime.timedelta(days=diff_ivol)).replace(hour=9).replace(minute=14)

# Winddown
over_night = 0.35
day_time = 1 - over_night

# Interval(minute, day, 3 minute, 5 minute...)
interval = "minute"
interval_rvol = 'minute'
interval_ivol = '5minute'

#slidingWindow = [5, 10, 15, 30, 60]
slidingWindow = [5]
min_winddown = 0.01
dbDateRange = 10
iterations = 5

interest_rate_india: float = 0.033786 #91 day T-bills
days_per_year_iv = 365
minutes_in_a_yr = 525600

developerUrl = "https://developers.kite.trade/"
baseLoginUrl = "https://kite.trade/connect/login"



url = baseLoginUrl + "?api_key=" + apiKey + "&v=3"
user_id_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[1]/input"
password_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[2]/input"
submit_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[4]/button"
pin_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[2]/div/input"
continue_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[3]/button"
