from sql.engine import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)
config_table = Table('config', metadata, autoload=True, autoload_with=engine)

#config_table_stmt = select([ config_table.columns.instrument_token, config_table.columns.t_start, config_table.columns.t_end, config_table.columns.tradingsymbol, config_table.columns.avg_hedge_per_day ])
config_table_stmt = select([ config_table ])

connection = engine.connect()
configuration = connection.execute(config_table_stmt).fetchall()
configurationKey = connection.execute(config_table_stmt).keys()
#print(configurationKey)


def index(configurationKey, configuration):
    json_data=[]
    for result in configuration:
        json_data.append(dict(zip(configurationKey, result)))
    return json_data

configurationObj = index(configurationKey, configuration)

#print(configurationObj[0]['instrument_token'], configurationObj[0]['tradingsymbol'])