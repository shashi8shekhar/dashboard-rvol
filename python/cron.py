import datetime
from rVolScheduler import RealTimePopulateRealisedVolData

runRvolScheduler = RealTimePopulateRealisedVolData()
runRvolScheduler.main()

print ( datetime.datetime.now() )