print('configDetails')
import engine
from sqlalchemy import select, MetaData, Table, and_

class ConfigDetails:
    __instance = None
    @staticmethod
    def getInstance():
        if ConfigDetails.__instance == None:
            ConfigDetails()
        return ConfigDetails.__instance

    def __init__(self):
        if ConfigDetails.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            metadata = MetaData(bind=None)
            config_table = Table('config', metadata, autoload=True, autoload_with=engine.Engine.getInstance().getEngine())

            config_table_stmt = select([ config_table ])

            connection = engine.Engine.getInstance().getEngine().connect()
            self.configuration = connection.execute(config_table_stmt).fetchall()
            self.configurationKey = connection.execute(config_table_stmt).keys()
            print ('Got Config')
            connection.close()

            ConfigDetails.__instance = self

    def getConfig(self):
        json_data=[]
        for result in self.configuration:
            json_data.append(dict(zip(self.configurationKey, result)))
        return json_data
