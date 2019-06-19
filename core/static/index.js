document.addEventListener('DOMContentLoaded', () => {

    // check if username is already saved in local storage, if not then show username form
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-form').style.display = "block";
    }
    else {
        document.querySelector('#result').innerHTML = `You are signed in as ${localStorage.getItem('username')}`;
        document.querySelector('#signout').style.display = "block";
        document.querySelector('#channelName-form').style.display = "block";
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
                document.querySelector('#channelName-form').style.display = "block";
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
        document.querySelector('#channelName-form').style.display = "none";
        document.querySelector('#delete-channel').style.display = "none";
        document.querySelector('#username').value = "";
        document.querySelector('#result').innerHTML = "";
        document.querySelector('#username-form').style.display = "block";
    }

/*
    // adding a channel
    document.querySelector('#channelName-form').onsubmit = () => {
        // initialize new request
        const request = new XMLHttpRequest();
        const channelName = document.querySelector('#channelName').value;
        request.open('POST', '/addChannel');
        // callback function for when request completes
        request.onload = () => {
            // extract JSON data from request
            const data = JSON.parse(request.responseText);
            // save username to lacal storage and update the page if signing in is successful
            if (data.success) {
                alert('Valid Channel Name');

                const li = document.createElement('li');
                li.innerHTML = document.querySelector('#channelName').value;
                // Add new item to task list
                document.querySelector('#channels-list').append(li);


                document.querySelector('#channelName').value = "";
                //localStorage.setItem('username', username);
            }
            else {
                alert('Invalid Channel Name');
                document.querySelector('#channelName').value = "";
            }
        }
        // add data to send with request
        const data = new FormData();
        data.append('channelName', channelName);
        // send request
        request.send(data);
        return false;
    };
*/



    // connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // when connected, configure add channel button
    socket.on('connect', () => {
        document.querySelector('#channelSubmit').onclick = () => {
            channelName = document.querySelector('#channelName').value;
            socket.emit('channel name check', channelName);
        };
        
        document.querySelector('#channelDelete').onclick = () => {
            socket.emit('delete channel');
        };
    });

    socket.on('add channel', data => {
        if (data.success == "true") {
            alert('Valid Channel Name');
        }
        else {
            alert('Invalid Channel Name');
        }
    });

    /*
    // when a channel is created or deleted update channels in local storage
    socket.on('channels', data => {
        if (!data.success) {
            alert('Invalid Channel Name');
            //document.querySelector('#channelNameError').innerHTML = "Invalid Channel Name";
        }
        //localStorage.setItem('channels', data.total);
    });
    */
});