import settings
import importlib
import sys
from db import db
from flask import session

from users.models import User

def init_blueprints(app):
    blueprints = []
    for module in settings.MODULES:
        real_name = "{}.views".format(module)
        importlib.import_module(real_name)
        blueprints.append(getattr(sys.modules[real_name], "blueprint"))
    for blueprint in blueprints:
        app.register_blueprint(blueprint)

def init_database():
    models = []
    for model in settings.MODELS:
        importlib.import_module(model[0])
        models.append(getattr(sys.modules[model[0]], model[1]))
    db.create_tables(models, safe=True)

def get_current_user():
    if "uid" in session and session["logged_in"]:
        return User.get(User.id == session['uid'])
    return None
