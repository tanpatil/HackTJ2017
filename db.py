from peewee import SqliteDatabase, PostgresqlDatabase, Model
import settings

if settings.DEBUG:
    db = SqliteDatabase("database.db")
else:
    db = PostgresqlDatabase(settings.DATABASE["NAME"],
            user=settings.DATABASE["USER"],
            password=settings.DATABASE["PASSWORD"],
            host=settings.DATABASE["HOST"])


class BaseModel(Model):
    class Meta:
        database = db
