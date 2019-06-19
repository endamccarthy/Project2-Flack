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

'''
@main.route("/addChannel", methods=["POST"])
def addChannel():
    # query for username
    channelName = request.form.get("channelName")
    # make sure username is valid
    if channelName in channelNames:
        return jsonify({"success": False})
    channelNames.append(channelName)
    channels["total"] += 1
    return jsonify({"success": True})
'''

@socketio.on("channel name check")
def channel_name_check(channelName):
    if channelName in channelNames:
        emit("add channel", {"success": "False"}, broadcast=False)
    channelNames.append(channelName)
    channels["total"] += 1
    emit("add channel", {"success": "True"}, broadcast=True)


@socketio.on("delete channel")
def delete_channel():
    if channels["total"] > 0:
        del channelNames[-1]
        channels["total"] -= 1
    emit("channels", broadcast=True)
