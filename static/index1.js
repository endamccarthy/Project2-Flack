document.addEventListener("DOMContentLoaded", () => {
    get_username();
})

// here we are creating a funcion and a constant variable and assigning the function to the variable
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
            for (let each_name of data) {
                show_channel(each_name, socket);
            }
            show_active_channel(localStorage.getItem("channel"));
            change_message_title(localStorage.getItem("channel"));
        });

        socket.on("messages", data => {
            clear_messages();
            data.forEach(message => {
                show_message(message);
            });
        });
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
        socket.emit("get messages", { name: localStorage.getItem("channel")});
    }
};

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