const express = require("express");
const connectDB = require("./config/db.js");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes.js");
const chatRoutes = require("./routes/chatRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");
const path = require("path");

const app = express();
dotenv.config();
connectDB(); //Calling the database function to store the all data to the database.
app.use(express.json()); //To accept the json data.

app.use("/api/user", userRoutes); //The Login & Register routers.

app.use("/api/chat", chatRoutes); //The chat routes.

app.use("/api/message", messageRoutes); //The messages routes.

//------------------------- Deployment-----------------------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is Running successfully");
  });
}

//------------------------- Deployment-----------------------------

//For incorrect url entered by user, if any error occur use errorHandler function.
app.use(notFound);
app.use(errorHandler);

//Listen the server running port.
const Port = process.env.PORT || 5000;

const server = app.listen(Port, () => {
  console.log("Server Port : ", Port);
});

//This variable(io) now holds the instance of the Socket.IO server that can handle WebSocket connections and emit events to clients.
const io = require("socket.io")(server, {
  //First we are importing the socket.io package for real-time communications. The server variable(line: 27) represents an existing HTTP server that you pass to the socket.io instance to allow it to listen for WebSocket connections on that server.
  pingTimeout: 60000, //If user didn't send any message with in 60 seconds or something happens then pingTimeout will close the connection to save the bandwidth. (closing the socket connection).

  cors: {
    origin: "http://localhost:3000", //cors means Cross-Origin Resource Sharing, and it's used to control which domains are allowed to interact with your Socket.IO server. //The origin setting specifies the allowed origin (in this case, http://localhost:3000), which is the client’s URL. By specifying this, you're allowing only requests from this specific origin to connect to the Socket.IO server. Important: Without this CORS setting, browsers might block the connection due to security restrictions that prevent cross-origin requests unless explicitly allowed.
  },
});

//We are creating the socket io connection and then a callback function.
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  //This socket.on function will take user data from the frontend.
  socket.on("setup", (userData) => {
    socket.join(userData._id); //We are creating a new room with the id of the userData(parameter) for that particular user. And that room will be exculsive for that particular user only.
    console.log("User Logged in : " + userData._id);
    socket.emit("connected");
  });

  //When we click on the user for chat it will create an new room(sender) and when that particular user join's the same chat then our socket will throw him into this room for chating(1:1 chat).
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  //Showing typing indicator for users in the room that something typing in the chat.
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  //Showing typing indicator for users in the room that typing has been stopped typing during sending the chat in that room.
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  //Showing that user have recieved a new message.
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat; // I took the chat data from here.

    //If that chat doesn't have any users then just return.
    if (!chat.users) {
      return console.log("No users in the chat."); //This feature is for only the developers.
    }

    //If in room the sender sent's a message to the team of 5 members then the same message(sender message) shouldn't receive the same message for him in the room and that message to remaining 4 members.
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) {
        return;
      }
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
