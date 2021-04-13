from sql.configDetails import configurationObj
from sql.engine import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)

def runRvolSelectOnConfig():
    rVolData = {}
    for config in configurationObj:
        tableKey = 'rvol-' + str(config['instrument_token'])
        rVolData[tableKey] = []

        if engine.dialect.has_table(engine, tableKey):
            config_table = Table(tableKey, metadata, autoload=True, autoload_with=engine)
            config_table_stmt = select([ config_table ])

            connection = engine.connect()
            configuration = connection.execute(config_table_stmt).fetchall()
            configurationKey = connection.execute(config_table_stmt).keys()

            def index(configurationKey, configuration):
                json_data=[]
                for result in configuration:
                    json_data.append(dict(zip(configurationKey, result)))
                return json_data
            rVolData[tableKey] = index(configurationKey, configuration)
    return rVolData

rVolDataObj = runRvolSelectOnConfig()

#print(rVolDataObj)