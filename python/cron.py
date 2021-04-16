print('inside cron.py')
import rVolScheduler

f = rVolScheduler.RealTimePopulateRealisedVolData()

f.a("execute a with a")
f.getLastUpdatedRow({}, {})
f.a("execute a with b")
print('getLastUpdatedRow')
f.runSchedulerOnConfig()
f.a("execute a with c")
print('runSchedulerOnConfig')