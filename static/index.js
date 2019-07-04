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
        document.querySelector('#signout').style.display = "none";
        document.querySelector('#channel-section').style.display = "none";
        document.querySelector('#message-section').style.display = "none";
        document.querySelector('#username').value = "";
        document.querySelector('#result').innerHTML = "";
        document.querySelector('#username-form').style.display = "block";
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
            const test = document.querySelector('#newMessage').value;
            localStorage.setItem('messageTest', test);
            socket.emit('testMessage', {'test': test});
        };
    });

    socket.on('addChannel', data => {
        if (data.success == 0) {
            alert('Channel name already in use, please choose another.');
        }
    });

    // When a new message is added, add to the unordered list
    socket.on('newMessage', data => {
        document.querySelector('#messages').innerHTML = localStorage.getItem('messageTest');
    });

});