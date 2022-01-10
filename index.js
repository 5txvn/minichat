//require express for the web server of the chat app
const express = require("express");
//create the express app
const app = express();
//create the server for socket.io
const server = require("http").createServer(app);
//require socket.io for the chat app
const io = require("socket.io")(server);
//require the bad words filter to filter the words
const Filter = require("bad-words");
//create the filter
filter = new Filter();
//require stormdb for the chat app
const StormDB = require("stormdb");
//load the database
const engine = new StormDB.localFileEngine("./db.stormdb");
//create the database
const db = new StormDB(engine);
//set the default for messages
db.default({ messages: [] });
const fs = require("fs");
//set the view engine to use ejs
app.set("view engine", "ejs");
//set socket.io lib server
app.get("/socket", (req, res) => {
  res.sendFile(__dirname + "/views/socket.io.js");
});
//set platform lib server
app.get("/platform", (req, res) => {
  res.sendFile(__dirname + "/views/platform.js");
});
//set icon
app.get("/icon", (req, res) => {
  res.sendFile(__dirname + "/views/chat-icon.png");
});
//set supported emojis
app.get("/emojis", (req, res) => {
  res.sendFile(__dirname + "/emojis.json");
});
//set ringtone
app.get("/ringtone", (req, res) => {
  res.sendFile(__dirname + "/views/ringtone.mp3");
});
//set the main chat page
app.get("/", (req, res) => {
  //get user ip
  const ip = req.headers["x-forwarded-for"];
  //get date and set time
  const date = new Date();
  const time =
    date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
  //append to logs
  fs.appendFileSync(
    "./logs/ip.log",
    ip + " has connected to the site at " + time + "\n"
  );
  res.render("index");
});
//set the about page
//execute when the user connects
io.on("connection", (socket) => {
  //load the messages
  const messages = db.state.messages;
  //handle recieving messages
  socket.emit("recieve", messages);
  //handle sent messages
  socket.on("send", (message) => {
    if (message.length < 3) {
      //filter the messages
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
//host the server on port 3000
server.listen(3000);
