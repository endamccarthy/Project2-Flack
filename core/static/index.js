document.addEventListener('DOMContentLoaded', () => {

    document.querySelector('#signout').style.display = "none";

    // check if username is already saved in local storage, if not then set it to the form response
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-text').innerHTML = "";
        document.querySelector('#username-form').onsubmit = () => {
            localStorage.setItem('username', document.querySelector('#username').value);
            document.querySelector('#signout').style.display = "block";
            alert(`You are signed as ${localStorage.getItem('username')}`)
        };
    }
    else {
        document.querySelector('#username-text').innerHTML = `Signed in as: ${localStorage.getItem('username')}!`;
        document.querySelector('#username-form').style.display = "none";
        document.querySelector('#signout').style.display = "block";
    }

    // sign out
    document.querySelector('#signout').onclick = () => {
        localStorage.clear();
        document.querySelector('#username-text').innerHTML = "You are now signed out!";
        document.querySelector('#signout').style.display = "none";
        document.querySelector('#username-form').style.display = "block";
    }


    $('#ModalCenter').on('hidden.bs.modal', function (e) {
        document.querySelector('#channelName').placeholder = 'test'
    })


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

    // When a new channel is created......
    socket.on('channels', data => {
        localStorage.setItem('channels', data.total);
        document.querySelector('#channels').innerHTML = localStorage.getItem('channels');
    });


});