document.addEventListener('DOMContentLoaded', () => {

    // check if username is already saved in local storage, if not then show username form
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-form').style.display = "block";
    }
    else {
        document.querySelector('#result').innerHTML = `You are signed in as ${localStorage.getItem('username')}`;
        document.querySelector('#signout').style.display = "block";
        document.querySelector('#add-channel').style.display = "block";
        document.querySelector('#delete-channel').style.display = "block";
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
                document.querySelector('#add-channel').style.display = "block";
                document.querySelector('#delete-channel').style.display = "block";
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
        document.querySelector('#add-channel').style.display = "none";
        document.querySelector('#delete-channel').style.display = "none";
        document.querySelector('#username').value = "";
        document.querySelector('#result').innerHTML = "";
        document.querySelector('#username-form').style.display = "block";
    }

    // clear any previous errors or text from the add channel modal
    document.querySelector('#add-channel').onclick = () => {
        document.querySelector('#channelName').value = "";
        document.querySelector('#channelNameError').innerHTML = "";
    }


    // connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // when connected, configure add channel button
    socket.on('connect', () => {
        document.querySelector('#channelSubmit').onclick = () => {
            channelName = document.querySelector('#channelName').value;
            if (channelName.length < 2) {
                document.querySelector('#channelNameError').innerHTML = "Invalid Channel Name";
                return false;
            }
            socket.emit('add channel', channelName);
        };
        document.querySelector('#channelDelete').onclick = () => {
            socket.emit('delete channel');
        };
    });

    
    // when a channel is created or deleted update channels in local storage
    socket.on('channels', data => {
        if (!data.success) {
            document.querySelector('#channelNameError').innerHTML = "Invalid Channel Name";
        }
        //localStorage.setItem('channels', data.total);
    });
    
});