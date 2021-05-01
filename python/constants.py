print('constants')
import datetime
import pytz

UTC = pytz.utc
IST = pytz.timezone('Asia/Kolkata')

# Dates between which we need historical data
diff = 60
diff_rvol = 50
days_per_year = 256
secs_per_year = days_per_year * 24 * 3600
to_date = datetime.datetime.now(IST)
from_date = (to_date - datetime.timedelta(days=diff)).replace(hour=4)
from_date_rvol = (to_date - datetime.timedelta(days=diff_rvol)).replace(hour=4)

# Winddown
over_night = 0.35
day_time = 1 - over_night

# Interval(minute, day, 3 minute, 5 minute...)
interval = "minute"
interval_rvol = 'minute'

#slidingWindow = [5, 10, 15, 30, 60]
slidingWindow = [5]
min_winddown = 0.01
dbDateRange = 10
iterations = 20




baseLoginUrl = "https://kite.trade/connect/login"
password = "ankush1234"
pin = "434258"
apiKey = "kejb8tewdr6kk1bn"
userId = "HX5564"
apiSecret = "fdcl73by8psacinfxszkfhanv7t9ogb7"
url = baseLoginUrl + "?api_key=" + apiKey + "&v=3"
user_id_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[1]/input"
password_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[2]/input"
submit_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[4]/button"
pin_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[2]/div/input"
continue_xpath = "//*[@id=\"container\"]/div/div/div[2]/form/div[3]/button"
