from sql.engine import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)
winddown_5_table = Table('winddown_5', metadata, autoload=True, autoload_with=engine)

winddown_5_table_stmt = select([ winddown_5_table.columns.range, winddown_5_table.columns.winddown])

connection = engine.connect()
winddown5min = connection.execute(winddown_5_table_stmt).fetchall()