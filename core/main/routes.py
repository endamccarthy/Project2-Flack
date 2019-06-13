from flask import Blueprint, render_template, request, jsonify
from flask_socketio import emit
from core import socketio


# 'main' will be the name of the blueprint
main = Blueprint('main', __name__)


channels = {"total": 0}


@main.route("/")
def index():
    return render_template("index.html", title="Home", channels=channels)


@main.route("/signin", methods=["POST"])
def signin():
    # query for username
    username = request.form.get("username")
    # make sure username is valid
    if len(username) < 1:
        return jsonify({"success": False})
    return jsonify({"success": True})


@socketio.on("add channel")
def add_channel():
    channels["total"] += 1
    emit("channels", channels, broadcast=True)


@socketio.on("delete channel")
def delete_channel():
    if channels["total"] > 0:
        channels["total"] -= 1
    emit("channels", channels, broadcast=True)




    