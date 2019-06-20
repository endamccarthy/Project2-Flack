from flask import Blueprint, render_template, request, jsonify
from flask_socketio import emit
from core import socketio


# 'main' will be the name of the blueprint
main = Blueprint('main', __name__)


channels = {"total": 0}
channelNames = []


@main.route("/")
def index():
    return render_template("index.html", title="Home", channels=channels, channelNames=channelNames)


@main.route("/signin", methods=["POST"])
def signin():
    # query for username
    username = request.form.get("username")
    # make sure username is valid
    if len(username) < 1:
        return jsonify({"success": False})
    return jsonify({"success": True})


@socketio.on("channelNameCheck")
def channelNameCheck(channelName):
    if channelName in channelNames:
        emit("addChannel", {"success": "False"}, broadcast=False)
        return False
    channelNames.append(channelName)
    channels["total"] += 1
    emit("addChannel", {"success": "True"}, broadcast=True)


@socketio.on("deleteChannel")
def delete_channel():
    if channels["total"] > 0:
        del channelNames[-1]
        channels["total"] -= 1
    emit("channels", broadcast=True)
