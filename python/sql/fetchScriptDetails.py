from sql.engine import engine
from sqlalchemy import select, MetaData, Table, and_

metadata = MetaData(bind=None)
table = Table('winddown_10', metadata, autoload=True, autoload_with=engine)

stmt = select([ table.columns.range, table.columns.winddown])

connection = engine.connect()
results = connection.execute(stmt).fetchall()