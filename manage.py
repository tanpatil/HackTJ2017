#!/usr/bin/env python3

from flask_script import Manager
from app import app
from utils import init_database

manager = Manager(app)

@manager.command
def migrate():
    init_database()

if __name__ == '__main__':
    manager.run()
