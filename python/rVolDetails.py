print('inside rVolDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

class RealisedVolDetails:
    def __init__(self):
        engineObj = engine.Engine.getInstance()
        connection = engineObj.getEngine().connect()
        configDetailsObj = configDetails.ConfigDetails()
        self.rVolData = {}

        for config in configDetailsObj.getConfig():
            tableKey = 'rvol-' + str(config['instrument_token'])
            self.rVolData[tableKey] = []
            #print(config, tableKey)

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
                self.rVolData[tableKey] = index(configurationKey, configuration)
        connection.close()

    def getRealisedVol(self):
        return self.rVolData

print ('Got Realised Volatility')
