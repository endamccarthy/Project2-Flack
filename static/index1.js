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

        // NOT WORKING...FIX....
        // sets the public channel as the default if no other channel has been selected
        if(!localStorage.getItem("channel")) {
            document.querySelectorAll("#channel-list > li").forEach(e => {
                if(e.innerHTML == "Public") {
                    e.classList.add("active");
                }
            });
        };

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
            for (let each_name of data) {
                show_channel(each_name, socket);
            }
            show_active_channel(localStorage.getItem("channel"));
            change_message_title(localStorage.getItem("channel"));
        });

        socket.on("messages", data => {
            clear_messages();
            if(data) {
                data.forEach(message => {
                    show_message(message);
                });
            }
        });

        document.querySelector('#reset').onclick = () => {
            socket.emit("reset");
            localStorage.removeItem("username");
        };

    });
};


const setup = socket => {
    let channel_form = document.querySelector("#channel-form");
    let channel_name_input = document.querySelector("#channel-name");
    let message_form = document.querySelector("#message-form");
    let message_input = document.querySelector("#message-text");
    
    // when new channel is added....
    channel_form.addEventListener("submit", e => {
        // stops page reloading
        e.preventDefault();

        let name = channel_name_input.value;
        if(!name) {
            console.log("no name");
            return;
        }
        socket.emit("new channel", { name });
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
        socket.emit("new message", {
            message, channel, username: localStorage.getItem("username")
        });
        message_input.value = "";
    });

    // looks to server side memory to retrieve list of all channels
    socket.emit("get channels");

    // if a channel has been selected then look to server side memory for list of all messages in the channel
    if(localStorage.getItem("channel")) {
        socket.emit("get messages", { name: localStorage.getItem("channel") });
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
    });

    ul.appendChild(li);
};


const show_message = data => {
    if(localStorage.getItem("channel") == data.channel) {
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
            e.classList.add("active");
        }
        else {
            e.classList.remove("active");
        }
    });
};


const change_message_title = title_name => {
    if(title_name) {
        let title = document.querySelector("#channel-label");
        title.innerHTML = '<span class="text-muted"># </span>' + title_name;
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
