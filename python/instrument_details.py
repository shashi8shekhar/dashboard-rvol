print('InstrumentDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

class InstrumentDetails:
    __instance = None
    @staticmethod
    def getInstance():
        if InstrumentDetails.__instance == None:
            InstrumentDetails()
        return InstrumentDetails.__instance

    def __init__(self):
        if InstrumentDetails.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            engineObj = engine.Engine.getInstance().getEngine()
            connection = engineObj.connect()
            configDetailsObj = configDetails.ConfigDetails.getInstance()
            self.instrumentData = {}
            metadata = MetaData(bind=None)

            for config in configDetailsObj.getConfig():
                tableKey = 'instruments-' + str(config['instrument_token'])
                self.instrumentData[tableKey] = []
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
                    self.instrumentData[tableKey] = index(configurationKey, configuration)
                    #print(tableKey, len(self.instrumentData[tableKey]))
            connection.close()

            InstrumentDetails.__instance = self

    def getInstruments(self):
        #print('inside getInstruments', self.instrumentData)
        return self.instrumentData

print ('Got Instruments')
