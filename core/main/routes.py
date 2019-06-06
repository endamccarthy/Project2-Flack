from flask import Blueprint, render_template
from flask_socketio import emit
from core.main.forms import UsernameForm
from core import socketio


# 'main' will be the name of the blueprint
main = Blueprint('main', __name__)



@main.route("/", methods=['GET', 'POST'])
def index():
    form = UsernameForm()
    if form.validate_on_submit():
        return render_template("index.html", title="test", form=form)
        
    return render_template("index.html", title="Home", form=form)


@socketio.on("add channel")
def add_channel():
    total_channels = 0
    total_channels += 1
    emit("total channels", total_channels, broadcast=True)


@main.route("/contact")
def contact():
    return render_template("contact.html")


    