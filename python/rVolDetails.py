print('rVolDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

def runRvolSelectOnConfig():
    rVolData = {}
    engineObj = engine.Engine.getInstance()
    connection = engine.Engine.getInstance().getEngine().connect()
    configDetailsObj = configDetails.ConfigDetails()
    for config in configDetailsObj.getConfig():
        tableKey = 'rvol-' + str(config['instrument_token'])
        rVolData[tableKey] = []
        print(config, tableKey)

        if engineObj.getEngine().dialect.has_table(engineObj.getEngine(), tableKey):
            config_table = Table(tableKey, metadata, autoload=True, autoload_with=engineObj.getEngine())
            config_table_stmt = select([ config_table ])

            configuration = connection.execute(config_table_stmt).fetchall()
            configurationKey = connection.execute(config_table_stmt).keys()

            def index(configurationKey, configuration):
                json_data=[]
                for result in configuration:
                    json_data.append(dict(zip(configurationKey, result)))
                return json_data
            rVolData[tableKey] = index(configurationKey, configuration)
    connection.close()
    return rVolData

rVolDataObj = runRvolSelectOnConfig()
print ('Got Realised Volatility')
