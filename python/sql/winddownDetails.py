from configDetails import configurationObj
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

def runWinddownSelectOnConfig():
    windDownData = {}
    connection = engine.Engine.getInstance().getEngine().connect()
    for config in configurationObj:
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
        windDownData[tableKey] = index(configurationKey, configuration)
    connection.close()
    return windDownData

windDownDataObj = runWinddownSelectOnConfig()
print ('Got Winddown')