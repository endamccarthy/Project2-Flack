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
CHANNELS = {"Public": {"messages": deque([], maxlen=100), "username": "default"}}       # username keeps track of who created each channel


@app.route("/")
def index():
    return render_template("index.html")


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
        CHANNELS[data['name']] = {}
        CHANNELS[data['name']]['messages'] = deque(maxlen=100)
        CHANNELS[data['name']]['username'] = data['username']
        emit('new channel', {"name": data['name']}, broadcast=True)


# attaches timestamp to new message, saves message to selected channel
@socketio.on('new message')
def new_message(data):
    if 'channel' in data:
        data['created_at'] = int(time.time())
        CHANNELS[data['channel']]['messages'].append(data)
        emit('message', data, broadcast=True)


# emits a list of all the channel names
@socketio.on('get channels')
def get_channels():
    emit('channels', {"channels": list(CHANNELS.keys())})


# emits a dictionary containing a list of all the messages in a selected channel and the username of the creater of the channel
@socketio.on('get messages')
def get_messages(data):
    # if a channel has just been deleted then the emit will be broadcast to all, or else it will just emit local to user
    if 'deleted' in data:
        emit('messages', {"messages": list(CHANNELS[data['name']]['messages']), "username": CHANNELS[data['name']]['username'], "deleted": True}, broadcast=True)
    elif 'name' in data:
        emit('messages', {"messages": list(CHANNELS[data['name']]['messages']), "username": CHANNELS[data['name']]['username']})


# removes the channel from the CHANNELS dictionary
@socketio.on('delete channel')
def delete_channel(data):
    if 'name' in data:
        if data['name'] in CHANNELS:
            del CHANNELS[data['name']]
            emit('channels', {"channels": list(CHANNELS.keys()), "deleted": True}, broadcast=True)


'''
# Reset button for testing purposes
@socketio.on('reset')
def reset():
    USERS.clear()
    CHANNELS.clear()
    CHANNELS['Public'] = deque(maxlen=100)
'''

if __name__ == '__main__':
    socketio.run(app)

