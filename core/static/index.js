document.addEventListener('DOMContentLoaded', () => {

    // check if username is already saved in local storage, if not then show username form
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-form').style.display = "block";
    }
    else {
        document.querySelector('#result').innerHTML = `You are signed in as ${localStorage.getItem('username')}`;
        document.querySelector('#signout').style.display = "block";
        document.querySelector('#add-channel').style.display = "block";
    }


    document.querySelector('#username-form').onsubmit = () => {

        // Initialize new request
        const request = new XMLHttpRequest();
        const username = document.querySelector('#username').value;
        request.open('POST', '/signin');

        // Callback function for when request completes
        request.onload = () => {

            // Extract JSON data from request
            const data = JSON.parse(request.responseText);

            // Update the result div
            if (data.success) {
                localStorage.setItem('username', username);
                document.querySelector('#username-form').style.display = "none";
                document.querySelector('#signout').style.display = "block";
                document.querySelector('#add-channel').style.display = "block";
                document.querySelector('#result').innerHTML = `You are signed in as ${username}`;
            }
            else {
                alert('Please enter a valid username');
            }
        }

        // Add data to send with request
        const data = new FormData();
        data.append('username', username);

        // Send request
        request.send(data);
        return false;
    };

    /*
    // check if username is already saved in local storage, if not then set it to the form response
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-text').innerHTML = "";
        document.querySelector('#username-form').onsubmit = () => {
            localStorage.setItem('username', document.querySelector('#username').value);
            document.querySelector('#signout').style.display = "block";
            document.querySelector('#add-channel').style.display = "block";
            if (localStorage.getItem('channels') == 0) () => {
                document.querySelector('#delete-channel').style.display = "none";
            }
            else {
                document.querySelector('#delete-channel').style.display = "block";
            }
            alert(`You are signed as ${localStorage.getItem('username')}`)
        };
    }
    else {
        document.querySelector('#username-text').innerHTML = `Signed in as: ${localStorage.getItem('username')}!`;
        document.querySelector('#username-form').style.display = "none";
        document.querySelector('#signout').style.display = "block";
        document.querySelector('#add-channel').style.display = "block";
        if (localStorage.getItem('channels') == 0) () => {
            document.querySelector('#delete-channel').style.display = "none";
        }
        else {
            document.querySelector('#delete-channel').style.display = "block";
        }
    }
    */

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


    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure add channel button
    socket.on('connect', () => {
        document.querySelector('#channelSubmit').onclick = () => {
            socket.emit('add channel');
        };
        document.querySelector('#delete-channel').onclick = () => {
            socket.emit('delete channel');
        };
    });

    // When a new channel is created or deleted......
    socket.on('channels', data => {
        localStorage.setItem('channels', data.total);
        document.querySelector('#channels').innerHTML = localStorage.getItem('channels');
        if (localStorage.getItem('channels') == 0) () => {
            document.querySelector('#delete-channel').style.display = "none";
        }
        else {
            document.querySelector('#delete-channel').style.display = "block";
        }
    });

});