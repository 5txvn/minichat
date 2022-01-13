//express and socket.io stuff
const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'))
const cookieParser = require("cookie-parser");
app.use(cookieParser())
const server = require("http").createServer(app);
const io = require("socket.io")(server);

//extra stuff
const Filter = require("bad-words");
filter = new Filter();
const fs = require("fs");
const crypto = require("crypto");



const StormDB = require("stormdb");
const messagesEngine = new StormDB.localFileEngine("./db/messages.stormdb");
const messages = new StormDB(messagesEngine);
messages.default({ messages: [["Server", "Welcome to Minichat!"],["Steven","Hey"],["Steven","Sup"]] });
const loginsEngine = new StormDB.localFileEngine("./db/logins.stormdb");
const logins = new StormDB(loginsEngine);


app.get("/", (req, res) => {
  //eventually add a login page and then give cookie if login is correct
  if (req.cookies.id) {
    res.render("index")
  } else {
    res.render("pages/login")
  }
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const usernames = Object.keys(logins.state)
  //const position = usernames.indexOf(username)
  if (usernames.includes(username)) {
    if (logins.state[username].password == password) {
      console.log("login successful")
      res.cookie("username", username)
      res.cookie("password", password)
      res.cookie("id", logins.state[username].id)
      if (logins.state[username].name) {res.cookie("name", logins.state[username].name)}
      //res.cookie("id", id);
      res.redirect("/");
    }
  }
  //res.redirect('/')
})

app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const id = crypto.randomBytes(32).toString("hex");
  res.cookie("username", username);
  res.cookie("password", password);
  res.cookie("admin", "false");
  res.cookie("id", id);
  logins.set(username, {})
  .get(username)
  .set("password", password)
  .set("id", id)
  logins.save()
  res.redirect('/')
})

app.post("/submit-name/:name", (req, res) => {
  const username = req.cookies.username
  console.log(username)
  logins.get(username)
  .set("name", req.params.name)
  logins.save()
})

io.on("connection", (socket) => {

  //load the messages
  const loadedMessages = messages.state

  socket.emit("recieve", loadedMessages.messages);

  socket.on("send", (message) => {
    if (message.length < 3) {
      message[0] = filter.clean(message[0]);
      message[1] = filter.clean("placeholder " + message[1]).replace("placeholder ", "");
      //get the database and push the message
      messages.get("messages").push(message);
      //save the database state
      messages.save();
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