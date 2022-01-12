//express and socket.io stuff
const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.static('views'))
const cookieParser = require("cookie-parser");
app.use(cookieParser())
const server = require("http").createServer(app);
const io = require("socket.io")(server);

//extra stuff
const Filter = require("bad-words");
filter = new Filter();
const fs = require("fs");


//require stormdb for the chat app
const StormDB = require("stormdb");
//load the database
const engine = new StormDB.localFileEngine("./db/messages.stormdb");
//create the database
const db = new StormDB(engine);
//set the default for messages
db.default({ messages: [] });


app.get("/", (req, res) => {
  //eventually add a login page and then give cookie if login is correct
  res.render("index");
});


io.on("connection", (socket) => {

  //load the messages
  const messages = db.state.messages;

  socket.emit("recieve", messages);

  socket.on("send", (message) => {
    if (message.length < 3) {
      message[0] = filter.clean(message[0]);
      message[1] = filter.clean("placeholder " + message[1]).replace("placeholder ", "");
      //get the database and push the message
      db.get("messages").push(message);
      //save the database state
      db.save();
      //make the frontend recieve the message
      io.emit("recieve", message);
    }
  });
});

//make the app listen on port 3000 or process.env.PORT for heroku and stuff
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`App is running on port ${ PORT }`);
});