print('iVolDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

class IVolDetails:
    __instance = None
    @staticmethod
    def getInstance():
        if IVolDetails.__instance == None:
            IVolDetails()
        return IVolDetails.__instance

    def __init__(self):
        if IVolDetails.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            self.iVolData = {}
            engineObj = engine.Engine.getInstance().getEngine()
            connection = engineObj.connect()
            configDetailsObj = configDetails.ConfigDetails.getInstance()

            for config in configDetailsObj.getConfig():
                tableKey = 'ivol-' + str(config['instrument_token'])
                self.iVolData[tableKey] = []
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
                    self.iVolData[tableKey] = index(configurationKey, configuration)
            connection.close()

            IVolDetails.__instance = self

    def getIvol(self):
        return self.iVolData

print ('Got Implied Volatility')
