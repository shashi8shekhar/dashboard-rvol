from datetime import datetime
from constants import nse_holiday


def trading_day():
    def parse_date(dateObj):
        try:
            holiday = dateObj.strftime('%Y-%m-%d')
            return holiday

        except ValueError:

            return False

    if datetime.today().weekday() in [5, 6] or parse_date(datetime.today()) in nse_holiday:
        return False

    return True
