print('configDetails')
import engine
from sqlalchemy import select, MetaData, Table, and_

class ConfigDetails:
    def __init__(self):
        metadata = MetaData(bind=None)
        config_table = Table('config', metadata, autoload=True, autoload_with=engine.Engine.getInstance().getEngine())

        config_table_stmt = select([ config_table ])

        connection = engine.Engine.getInstance().getEngine().connect()
        self.configuration = connection.execute(config_table_stmt).fetchall()
        self.configurationKey = connection.execute(config_table_stmt).keys()
        print ('Got Config')
        connection.close()

    def getConfig(self):
        json_data=[]
        for result in self.configuration:
            json_data.append(dict(zip(self.configurationKey, result)))
        return json_data

