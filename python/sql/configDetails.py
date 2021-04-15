print('configDetails')
import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)
config_table = Table('config', metadata, autoload=True, autoload_with=engine.Engine.getInstance().getEngine())

config_table_stmt = select([ config_table ])

connection = engine.Engine.getInstance().getEngine().connect()
configuration = connection.execute(config_table_stmt).fetchall()
configurationKey = connection.execute(config_table_stmt).keys()

connection.close()


def index(configurationKey, configuration):
    json_data=[]
    for result in configuration:
        json_data.append(dict(zip(configurationKey, result)))
    return json_data

configurationObj = index(configurationKey, configuration)
print ('Got Config')
