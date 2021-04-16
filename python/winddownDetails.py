print('winddownDetails')
import configDetails
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

class WinddownDetails:
    def __init__(self):
        connection = engine.Engine.getInstance().getEngine().connect()
        configDetailsObj = configDetails.ConfigDetails()
        self.windDownData = {}

        for config in configDetailsObj.getConfig():
            tableKey = 'winddown-' + str(config['instrument_token'])
            windDownData[tableKey] = {}

            config_table = Table(tableKey, metadata, autoload=True, autoload_with=engine.Engine.getInstance().getEngine())
            config_table_stmt = select([ config_table ])

            configuration = connection.execute(config_table_stmt).fetchall()
            configurationKey = connection.execute(config_table_stmt).keys()

            def index(configurationKey, configuration):
                json_data=[]
                for result in configuration:
                    json_data.append(dict(zip(configurationKey, result)))
                return json_data
            self.windDownData[tableKey] = index(configurationKey, configuration)
        connection.close()

    def getWinddown(self):
        return self.windDownData

print ('Got Winddown')
