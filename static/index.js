document.addEventListener("DOMContentLoaded", () => {
    get_username();
})


// here we are creating a funcion and a constant variable and assigning the function to the variable
const get_username = () => {
    // retrieve username if already saved in local storage
    let username = localStorage.getItem("username");

    // if no username exists the username form modal is shown, otherwise the initialize function is called
    if(!username) {
        $(".modal").modal({ show: true, backdrop: "static"});

        document.querySelector("#username-form").addEventListener("submit", e => {
            e.preventDefault();
            username = document.querySelector("#username-text").value;
            console.log(username);
            // if username field is empty then nothing happens, otherwise save to local storage and initialize
            if (typeof username == "string") {
                username = username.trim()
                if (username == "") {
                    username = null;
                }
                else {
                    localStorage.setItem("username", username);
                    $(".modal").modal("hide");
                    initialize(username);
                }
            }
        });
    }
    else {
        initialize(username);
    }
};


const initialize = username => {
    // connect to web socket
    let socket = io.connect(location.protocol + "//" + document.domain + ":" + location.port);

    // once connected....
    socket.on("connect", () => {
        socket.emit("userdata", { username });
        setup(socket);

        socket.on("new channel", data => {
            show_channel(data.name, socket);
        });

        socket.on("message", data => {
            show_message(data);
        });

        socket.on("channels", data => {
            clear_channels();
            // data is a list of all the channel names, the following iterates over each name sending it to 
            // show_channel where it is then added to the HTML list and displayed
            for (let each_name of data.channels) {
                show_channel(each_name, socket);
            }
            if(localStorage.getItem("channel")) {
                show_active_channel(localStorage.getItem("channel"));
                change_message_title(localStorage.getItem("channel"));
            }
            // if a channel is being deleted....
            if(data.deleted) {
                socket.emit("get messages", { name: "Public", deleted: true });
            }
        });

        socket.on("messages", data => {
            clear_messages();
            if(data) {
                // show no messages text if channel is empty
                if(data.messages.length < 1) {
                    document.querySelector('#no-messages').style.display = "inline";
                }
                else {
                    document.querySelector('#no-messages').style.display = "none";
                }
                // show delete channel icon if user has created the channel
                if(data.username == localStorage.getItem("username")) {
                    document.querySelector('#delete-channel').style.display = "block";
                }
                else {
                    document.querySelector('#delete-channel').style.display = "none";
                }
                // if a channel is being deleted, set Public as the active channel for all users
                if(data.deleted) {
                    show_active_channel("Public");
                    change_message_title("Public");
                }
                // iterate through list of messages in channel and send each to show_message function
                data.messages.forEach(message => {
                    show_message(message);
                });
            }
        });
        /* reset button for testing purposes....
        document.querySelector('#reset').onclick = () => {
            socket.emit("reset");
            localStorage.removeItem("username");
        }; */
    });
};


const setup = socket => {
    let channel_form = document.querySelector("#channel-form");
    let channel_name_input = document.querySelector("#channel-name");
    let message_form = document.querySelector("#message-form");
    let message_input = document.querySelector("#message-text");
    let username = localStorage.getItem("username");
    
    // when new channel is added....
    channel_form.addEventListener("submit", e => {
        // stops page reloading
        e.preventDefault();

        let name = channel_name_input.value;
        if(!name) {
            console.log("no name");
            return;
        }
        socket.emit("new channel", { name, username });
        channel_name_input.value = "";
    });

    // when new message is added....
    message_form.addEventListener("submit", e => {
        e.preventDefault();
        
        let message = message_input.value;
        let channel = localStorage.getItem("channel");

        if(!message) {
            console.log("no message");
            return;
        }
        if(!channel) {
            console.log("no channel");
            return;
        }
        document.querySelector('#no-messages').style.display = "none";
        socket.emit("new message", { message, channel, username: username });
        message_input.value = "";
    });

    // looks to server side memory to retrieve list of all channels
    socket.emit("get channels");

    // if a channel has been selected then look to server side memory for list of all messages in the channel
    if(localStorage.getItem("channel")) {
        socket.emit("get messages", { name: localStorage.getItem("channel") });
    }
    else {
        socket.emit("get messages", { name: "Public" });
    }
};


const show_channel = (name, socket) => {
    let ul = document.querySelector("#channel-list");
    let li = document.createElement("li");

    // adds the class "list-group-item" to each list item
    li.classList.add("list-group-item");
    li.innerHTML = name;

    // when a channel is clicked on....
    li.addEventListener("click", () => {
        localStorage.setItem("channel", name);
        socket.emit("get messages", { name });
        change_message_title(name);
        show_active_channel(name);
        // if delete channel is clicked on....
        document.querySelector('#delete-channel').onclick = () => {
            localStorage.removeItem("channel");
            clear_messages();
            socket.emit("delete channel", { name: name });
        };
    });

    ul.appendChild(li);
};


const show_message = data => {
    if(localStorage.getItem("channel") == data.channel || data.channel == "Public") {
        let ul = document.querySelector("#message-list");
        let li = document.createElement("li");
        li.classList.add("list-group-item");

        // shows username in bold, then the message, then the date created at in small text
        li.innerHTML = `<strong>${data.username}</strong>: &nbsp;${data.message} <small class="text-muted d-flex justify-content-end">
                        ${get_date_string(data.created_at)}</small>`;
        ul.appendChild(li);

        // enables scrolling of messages
        ul.scrollTop = ul.scrollHeight - ul.clientHeight;
    }
};


const show_active_channel = name => {
    // iterates through each list item checking to see if the text equals the name selected
    document.querySelectorAll("#channel-list > li").forEach(e => {
        if(e.innerHTML == name) {
            e.classList.add("selected");
        }
        else {
            e.classList.remove("selected");
        }
    });
};


const change_message_title = title_name => {
    if(title_name) {
        let title = document.querySelector("#channel-label");
        title.innerHTML = title_name;
    }
};


const clear_messages = () => {
    let ul = document.querySelector("#message-list");
    ul.innerHTML = "";
};


const clear_channels = () => {
    let ul = document.querySelector("#channel-list");
    ul.innerHTML = "";
};


const get_date_string = time => {
    time = new Date(time * 1000);
    let m_string = `${time.toDateString().split(" ")[1]} ${time.getDate()}`;

    if(time.getFullYear() != new Date().getFullYear()) {
        m_string += `, ${time.getFullYear()}`;
    }

    return `${time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true
    })} | ${m_string}`;
};
