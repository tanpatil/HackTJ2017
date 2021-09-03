from flask import request, g, flash, redirect, url_for
from functools import wraps


def login_required(f):
    @wraps(f)
    def _decorated(*args, **kwargs):
        if g.user is not None:
            return f(*args, **kwargs)
        else:
            flash("You must be logged in to perform this action.", "error")
            return redirect(url_for("users.login", next=request.path))
    return _decorated
