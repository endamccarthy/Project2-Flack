import os, time

from flask import Flask, render_template, request
from flask_socketio import emit, SocketIO
from collections import deque

app = Flask(__name__)

# configure socketio
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# server side memory (deque ensures only 100 most recent messages are saved, the rest will be popped off)
USERS = {}
CHANNELS = {"Public": deque([], maxlen=100)}


@app.route("/")
def index():
    return render_template("index1.html")

# DELETE.....
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
@socketio.on('get messages')
def get_messages(data):
    if 'name' in data:
        emit('messages', list(CHANNELS[data['name']]))


# DELETE....
@socketio.on('reset')
def reset():
    USERS.clear()
    CHANNELS.clear()
    CHANNELS['Public'] = deque(maxlen=100)


if __name__ == '__main__':
    socketio.run(app)
