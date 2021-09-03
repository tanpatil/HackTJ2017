from db import BaseModel
from peewee import CharField
from playhouse.fields import PasswordField

class User(BaseModel):
    name = CharField()
    email = CharField(unique=True)
    password = PasswordField()
