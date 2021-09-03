from db import BaseModel
from peewee import ForeignKeyField, CharField, IntegerField

from users.models import User

class Program(BaseModel):
    owner = ForeignKeyField(User)
    name = CharField(null=True)
    json = CharField(null=True)

class Trigger(BaseModel):
    trigger_type = CharField()
    args = CharField()
    results = CharField()

class Event(BaseModel):
    args = CharField()
    action = CharField()

class Condition(BaseModel):
    in_val = CharField()
    check = CharField()
    out_val = CharField()

class Loop(BaseModel):
    loop_type = CharField()
    condition = ForeignKeyField(Condition)

class Block(BaseModel):
    program = ForeignKeyField(Program)
    trigger = ForeignKeyField(Trigger, null=True)
    event = ForeignKeyField(Event, null=True)
    condition = ForeignKeyField(Condition, null=True)
    loop = ForeignKeyField(Loop, null=True)
    block_type = CharField()

class Link(BaseModel):
    source = ForeignKeyField(Block, related_name="source_link")
    destination = ForeignKeyField(Block, related_name="dest_link")

class ConditionLink(BaseModel):
    source = ForeignKeyField(Condition)
    inner = ForeignKeyField(Block, related_name="inner_link")
    outer = ForeignKeyField(Block, related_name="outer_link")
