from flask import Blueprint, render_template
from flask_socketio import emit
from core.main.forms import UsernameForm, ChannelNameForm
from core import socketio


# 'main' will be the name of the blueprint
main = Blueprint('main', __name__)


channels = {"total": 0}


@main.route("/", methods=['GET', 'POST'])
def index():
    usernameform = UsernameForm()
    channelnameform = ChannelNameForm()
    if usernameform.validate_on_submit():
        return render_template("index.html", title="test", usernameform=usernameform, channelnameform=channelnameform, channels=channels)
    if channelnameform.validate_on_submit():
        return render_template("index.html", title="test1", usernameform=usernameform, channelnameform=channelnameform, channels=channels)
    return render_template("index.html", title="Home", usernameform=usernameform, channelnameform=channelnameform, channels=channels)


@socketio.on("add channel")
def add_channel():
    channels["total"] += 1
    channelnameform = ChannelNameForm()
    emit("channels", channels, channelnameform, broadcast=True)


@socketio.on("delete channel")
def delete_channel():
    channels["total"] -= 1
    emit("channels", channels, broadcast=True)




    