document.addEventListener('DOMContentLoaded', () => {

    // check if username is already saved in local storage, if not then show username form
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-form').style.display = "block";
    }
    else {
        document.querySelector('#result').innerHTML = `You are signed in as ${localStorage.getItem('username')}`;
        document.querySelector('#signout').style.display = "block";
        document.querySelector('#channel-section').style.display = "block";
        document.querySelector('#message-section').style.display = "block";
    }

    // signing in process
    document.querySelector('#username-form').onsubmit = () => {
        // initialize new request
        const request = new XMLHttpRequest();
        const username = document.querySelector('#username').value;
        request.open('POST', '/signin');
        // callback function for when request completes
        request.onload = () => {
            // extract JSON data from request
            const data = JSON.parse(request.responseText);
            // save username to lacal storage and update the page if signing in is successful
            if (data.success) {
                localStorage.setItem('username', username);
                document.querySelector('#username-form').style.display = "none";
                document.querySelector('#signout').style.display = "block";
                document.querySelector('#channel-section').style.display = "block";
                document.querySelector('#message-section').style.display = "block";
                document.querySelector('#result').innerHTML = `You are signed in as ${username}`;
            }
            else {
                alert('Please enter a valid username');
            }
        }
        // add data to send with request
        const data = new FormData();
        data.append('username', username);
        // send request
        request.send(data);
        return false;
    };

    // sign out
    document.querySelector('#signout').onclick = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('count');
        document.querySelector('#signout').style.display = "none";
        document.querySelector('#channel-section').style.display = "none";
        document.querySelector('#message-section').style.display = "none";
        document.querySelector('#username').value = "";
        document.querySelector('#result').innerHTML = "";
        document.querySelector('#username-form').style.display = "block";
    }


    if (document.querySelector('#test1')) {
        document.querySelector('#test1').onclick = () => {
            document.querySelector('#newMessage').disabled = false;
            document.querySelector('#messageSubmit').disabled = false;
        }
    }
    

    // connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);
    

    // when connected, configure add channel button
    socket.on('connect', () => {

        document.querySelector('#channelSubmit').onclick = () => {
            channelName = document.querySelector('#channelName').value;
            socket.emit('channelNameCheck', channelName);
        };

        document.querySelector('#messageSubmit').onclick = () => {
            const message = document.querySelector('#newMessage').value;
            socket.emit('addMessage', {'message': message});
        };

    });


    socket.on('addChannel', data => {
        if (data.channelName == "invalid") {
            alert('Channel name already in use, please choose another.');
        }
    });

    // When a new message is added, add to the unordered list
    socket.on('newMessage', data => {
        const li = document.createElement('li');
        li.innerHTML = `${data.message}`;
        document.querySelector('#messages').append(li);
    });

});

