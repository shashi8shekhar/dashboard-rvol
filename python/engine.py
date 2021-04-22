print('engine')
import os
from sqlalchemy import create_engine

class Engine:
    __instance = None
    @staticmethod
    def getInstance():
        if Engine.__instance == None:
            Engine()
        return Engine.__instance

    def __init__(self):
        if Engine.__instance != None:
            raise Exception("This class is a singleton!")
        else:
            user = os.environ['MYSQL_USER']
            passw = os.environ['MYSQL_PASSWORD']
            host = os.environ['MYSQL_HOST_IP']
            port = os.environ['REACT_APP_SERVER_PORT']
            database = os.environ['MYSQL_DATABASE']
            self.engine = create_engine('mysql+pymysql://' + user + ':' + passw + '@' + host + '/' + database , echo=False)
            Engine.__instance = self

    def getEngine(self):
        return self.engine
