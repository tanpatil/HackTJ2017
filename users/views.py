from flask import Blueprint, request, redirect, flash, g, render_template, url_for, session

from .models import User

from utils import get_current_user

blueprint = Blueprint("users", __name__, url_prefix="/user")

@blueprint.route("/login/", methods=["GET", "POST"])
def login():
    if g.user:
        return redirect(url_for("index"))
    if request.method == "POST":
        error = False
        try:
            u = User.get(User.email == request.form.get("email", ""))
            if not u.password.check_password(request.form.get("password", "")):
                error = True
        except User.DoesNotExist:
            error = True
        if error:
            flash("Failed login!", "error")
            return render_template("login.html", email=request.form.get("email",""))
        else:
            session["uid"] = u.id
            session["logged_in"] = True
            return redirect(request.args.get("next", url_for("index")))
    else:
        return render_template("login.html")

@blueprint.route("/register/", methods=["GET", "POST"])
def register():
    if g.user:
        return redirect(url_for("index"))
    if request.method == "POST":
        name = request.form.get("name", None)
        email = request.form.get("email", None)
        password = request.form.get("password", None)
        confirm = request.form.get("confirm", None)
        if not name or not email or not password:
            flash("Please fill out all of the fields!", "error")
            return redirect(url_for("users.register"))
        if password != confirm:
            flash("Confirmation does not match password!", "error")
            return redirect(url_for("users.register"))
        try:
            u = User.get(User.email == email)
            flash("An account with this email already exists!", "error")
            return redirect(url_for("users.login"))
        except User.DoesNotExist:
            pass
        u = User.create(name=name, email=email, password=password)
        flash("Your account has been created!", "success")
        session["uid"] = u.id
        session["logged_in"] = True
        return redirect(url_for("index"))
    else:
        return render_template("register.html")

@blueprint.route("/logout/")
def logout():
    session["uid"] = -1
    session["logged_in"] = False
    return redirect(url_for("index"))

@blueprint.route("/settings", methods=["GET","POST"])
def settings():
    return redirect(url_for("index"))
    # No use for a real settings page
    # return render_template("settings.html", user=g.user)

@blueprint.before_app_request
def set_user():
    g.user = get_current_user()
