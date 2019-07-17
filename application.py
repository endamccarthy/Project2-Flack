import os
import time

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

from collections import deque

app = Flask(__name__)

# configure socketio
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# server side memory (deque ensures only 100 most recent messages are saved, the rest will be popped off)
USERS = {}
CHANNELS = {"Public": deque([], maxlen=100)}

'''
channels = {"total": 0}
channelNames = []
'''

@app.route("/")
def index():
    return render_template("index1.html")

@socketio.on('connect')
def connection():
    print("new user connected")

# if a username is passed in then the associated session ID is assigned to the username
@socketio.on('userdata')
def user_data(data):
    if 'username' in data:
        USERS[data['username']] = request.sid

# checks if a channel name isn't taken and saves it to the CHANNELS dictionary (only 100 most recent messages in channel will be saved)
@socketio.on('new channel')
def new_channel(data):
    if data['name'] in CHANNELS:
        return False
    else:
        CHANNELS[data['name']] = deque(maxlen=100)
        emit('new channel', {"name": data['name']}, broadcast=True)

# attaches timestamp to new message, saves message to selected channel
@socketio.on('new message')
def new_message(data):
    if 'channel' in data:
        data['created_at'] = int(time.time())
        CHANNELS[data['channel']].append(data)
        emit('message', data, broadcast=True)

# emits a list of all the channel names
@socketio.on('get channels')
def get_channels():
    emit('channels', list(CHANNELS.keys()))

# emits a list of all the messages in a selected channel
@socketio.on('get messgaes')
def get_messages(data):
    if 'name' in data:
        emit('messages', list(CHANNELS[data['name']]))

'''
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
        emit("addChannel", {"channelName": "invalid"}, broadcast=False)
        return False
    channelNames.append(channelName)
    channels["total"] += 1
    emit("addChannel", {"channelName": channelName}, broadcast=True)


@socketio.on("addMessage")
def addMessage(data):
    message = data["message"]
    emit("newMessage", {"message": message}, broadcast=True)
'''

if __name__ == '__main__':
    socketio.run(app)
    
