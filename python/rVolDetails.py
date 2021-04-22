print('rVolDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

class RVolDetails:
    __instance = None
    @staticmethod
    def getInstance():
        if RVolDetails.__instance == None:
            RVolDetails()
        return RVolDetails.__instance

    def __init__(self):
        if RVolDetails.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            self.rVolData = {}
            engineObj = engine.Engine.getInstance().getEngine()
            connection = engineObj.connect()
            configDetailsObj = configDetails.ConfigDetails.getInstance()

            for config in configDetailsObj.getConfig():
                tableKey = 'rvol-' + str(config['instrument_token'])
                self.rVolData[tableKey] = []
                table_exist = engineObj.has_table(tableKey)
                #print(config, tableKey)

                if table_exist:
                    config_table = Table(tableKey, metadata, autoload=True, autoload_with=engineObj)
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

            RVolDetails.__instance = self

    def getRvol(self):
        return self.rVolData

print ('Got Realised Volatility')
