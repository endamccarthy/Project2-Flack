import os

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


channels = {"total": 0}
channelNames = []
status = {"success": 1}


@app.route("/")
def index():
    return render_template("index.html", title="Home", channels=channels, channelNames=channelNames, status=status)


@app.route("/signin", methods=["POST"])
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
        status["success"] = 0
        emit("addChannel", status, broadcast=False)
        print(status)
        return False
    channelNames.append(channelName)
    channels["total"] += 1
    status["success"] = 1
    print(status)
    emit("addChannel", status, broadcast=True)


if __name__ == '__main__':
    socketio.run(app)
    