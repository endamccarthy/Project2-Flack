document.addEventListener('DOMContentLoaded', () => {


    // Check if username is already saved in local storage, if not then set it to the form response
    if (!localStorage.getItem('username')) {
        document.querySelector('#username-text').innerHTML = "";
        document.querySelector('#username-form').onsubmit = () => {
            localStorage.setItem('username', document.querySelector('#username').value);
            alert(`You are signed as ${localStorage.getItem('username')}`)
        };
    }
    else {
        document.querySelector('#username-text').innerHTML = `Signed in as: ${localStorage.getItem('username')}!`;
    }

    document.querySelector('#signout').onclick = () => {
        localStorage.clear();
        document.querySelector('#username-text').innerHTML = "You are now signed out!";
    }


});