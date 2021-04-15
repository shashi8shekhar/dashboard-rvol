import datetime

import sys

print('inside cron')
for p in sys.path:
    print(p)

from rVolScheduler import RealTimePopulateRealisedVolData
#runRvolScheduler = RealTimePopulateRealisedVolData()
#runRvolScheduler.main()