const messages = document.getElementById("messages")
      const resetInput = () => $("#message").val("");
      const scrollDown = () => messages.scrollTop = messages.scrollHeight;
        //get the input
      const input = document.getElementById("message");

      //add an event listener to submit messages
      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          sendMessage();
        }
      });

      var emojiData;

      $.get('/emojis', async (data, status) => {
        console.log(data)
      })

      //use socket.io to send messages
      const socket = io();

      //once socket.io recieves a message, it will send it to the client
      socket.on("recieve", (message) => {
        if (message.length > 2 && typeof message === "object") {
          message.forEach((element) => {
            $("#messages").append(`${element[0]}: <span class="text-secondary">${element[1]}</span><br>`)
          });
          scrollDown()
        } else {
            $("#messages").append(`${message[0]}: <span class="text-secondary">${message[1]}</span><br>`);
            //const ringtone = new Audio("/ringtone")
          //ringtone.play()
          scrollDown()
        }
      });

        //send message to server
      function sendMessage() {
        var message = $("#message").val();
        //games and extra stuff
        switch(message) {
          case "/slope":
            window.open("https://storage.y8.com/y8-studio/unity/joll/slope/?key=9757549&value=80527");
            scrollDown();
            break;
          default:
            null
        }
        if (message === "/version") {
          $("#messages").append("Server: You are currently running Minichat v1.0.0")
            resetInput();
            scrollDown()
        } 
        else if (message.startsWith("/setname")) {
          //check if cookies are enabled or not
          if (navigator.cookieEnabled) {
            //if cookies are enabled, set the name cookie
          const name = message.split(" ")[1];
          if (!name.includes(">") && !name.includes("<")) {
          document.cookie = `name=${name}`;
          resetInput()
          }
          document.getElementById("messages").innerHTML += "Server: You have changed your name to " + name + "<br>";
          } else {
            //if cookies are not enables, output error message
            $("#messages").append("Server: You must enable cookies to change your name. Currently, you have cookies disabled, but you can learn how to enable them <a class='text-info' href='https://support.google.com/accounts/answer/61416?hl=en&co=GENIE.Platform%3DDesktop'>here</a><br>");
            resetInput()
          }
          scrollDown()
        }
        else if (message === "/help") {
            document.getElementById("messages").innerHTML += `Server: Available commands - /version, /setname, /help<br>/version: Outputs the current version of Minichat you are running<br>/setname: Sets your name to the name you specify, use like /setname <name><br>/help: Outputs the available commands and what they do`
               resetInput()
               scrollDown()
        }
        else if (message === "/os") {
          $("#messages").append(`Server: You are currently running ${platform.os}<br>`);
          resetInput()
          scrollDown()
        }
        else {
          $.get('/emojis', (data, status) => {
            const keys = Object.keys(data)
            keys.every(key => {
              if (message.includes(key)) {
                message = message.replace(key, data[key])
                return false
              }
              return true
            })
            //parse the cookie string
            const cookie =  document.cookie.split('; ').reduce((prev, current) => {
    const [name, ...value] = current.split('=');
    prev[name] = value.join('=');
    return prev;
  }, {});

  //if the cookie is set, send the message with the name
  if (cookie.name && !message.includes("<") && !message.includes(">")) {
      socket.emit("send", [cookie.name, message]);
      resetInput()
  } 
  //if the cookie is not set, send the message as anonymous
  else if (!message.includes("<") && !message.includes(">")) {
      socket.emit("send", ["Anonymous", message])
      resetInput()
  } 
  else {
    $("#messages").append("Server: <span class='text-danger'>Invalid message. You are not permitted to use html in your message.</span>")
  }
})
        }
      }
      setInterval(() => {
        if ($("#messages").text() != "Messages loading...") {
          $("#messages").append('Server: Welcome to minichat <span class="text-secondary">v1.0.0</span>! For more information, type <span class="text-info">/help</span> in the chat.<br>')
        scrollDown()
        clearInterval()
        }
      }, 100)