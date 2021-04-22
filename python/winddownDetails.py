print('winddownDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

class WinddownDetails:
    __instance = None
    @staticmethod
    def getInstance():
        if WinddownDetails.__instance == None:
            WinddownDetails()
        return WinddownDetails.__instance

    def __init__(self):
        if WinddownDetails.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            engineObj = engine.Engine.getInstance().getEngine()
            connection = engineObj.connect()
            configDetailsObj = configDetails.ConfigDetails.getInstance()
            self.windDownData = {}
            metadata = MetaData(bind=None)

            for config in configDetailsObj.getConfig():
                tableKey = 'winddown-' + str(config['instrument_token'])
                self.windDownData[tableKey] = []
                table_exist = engineObj.has_table(tableKey)

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
                    self.windDownData[tableKey] = index(configurationKey, configuration)
                    #print(tableKey, len(self.windDownData[tableKey]))
            connection.close()

            WinddownDetails.__instance = self

    def getWinddown(self):
        #print('inside getWinddown', self.windDownData)
        return self.windDownData

print ('Got Winddown')
