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


@main.route("/addChannel", methods=["POST"])
def addChannel():
    print("test")
    # query for username
    channelName = request.form.get("channelName")
    print("test1")
    # make sure username is valid
    if channelName in channelNames:
        print("test2")
        return jsonify({"success": False})
    print("test3")
    channelNames.append(channelName)
    channels["total"] += 1
    return jsonify({"success": True})

'''
@socketio.on("add channel")
def add_channel(channelName):
    if channelName in channelNames:
        print("test")
        emit("channels", {"success": False}, broadcast=False)
        print("test1")
        return False
    print("test2")
    channelNames.append(channelName)
    channels["total"] += 1
    emit("channels", broadcast=True)
'''

@socketio.on("delete channel")
def delete_channel():
    if channels["total"] > 0:
        del channelNames[-1]
        channels["total"] -= 1
    emit("channels", broadcast=True)
