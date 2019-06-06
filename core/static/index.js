document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#submit').disabled = true;

    // check if username is already saved in local storage, if not then set it to the form response
    if (!localStorage.getItem('username')) {
        document.querySelector('#submit').disabled = false;
        document.querySelector('#username-text').innerHTML = "";
        document.querySelector('#username-form').onsubmit = () => {
            localStorage.setItem('username', document.querySelector('#username').value);
            alert(`You are signed as ${localStorage.getItem('username')}`)
        };
    }
    else {
        document.querySelector('#username-text').innerHTML = `Signed in as: ${localStorage.getItem('username')}!`;
    }

    // sign out
    document.querySelector('#signout').onclick = () => {
        localStorage.clear();
        document.querySelector('#username-text').innerHTML = "You are now signed out!";
        document.querySelector('#submit').disabled = false;
    }

    
    
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {
        document.querySelector('#add-channel').onclick = () => {
            socket.emit('add channel');
        };
    });

    // When a new vote is announced, add to the unordered list
    socket.on('total channels', data => {
        document.querySelector('#total-channels').innerHTML = data;
    });



});