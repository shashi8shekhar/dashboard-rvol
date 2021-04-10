import os
from sqlalchemy import create_engine

user = os.environ['MYSQL_USER']
passw = os.environ['MYSQL_PASSWORD']
host = os.environ['MYSQL_HOST_IP']
port = os.environ['REACT_APP_SERVER_PORT']
database = os.environ['MYSQL_DATABASE']

engine = create_engine('mysql+pymysql://' + user + ':' + passw + '@' + host + '/' + database , echo=False)