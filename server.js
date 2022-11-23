///express app
const express = require("express");
require("dotenv").config();
const mongodb = require("./src/databases/init.mongodb");
const app = express();
const http = require("http");
let cors = require("cors");
const server = http.createServer(app);
///socket io
const { Server } = require("socket.io");

const socketService = require("./src/services/chat.service");

const createError = require("http-errors");
const userRouter = require("./src/routes/user.router");
const userContactRouter = require("./src/routes/user_contact.route");
const conversationRouter = require("./src/routes/conversation.router");
const messageNotificationRouter = require("./src/routes/message_notification.route");

const io = new Server(server, {
  cors: {
    origin: process.env.SERVER_URL,
  },
});

//create io global variable
global._io = io;

app.use(express.json());

app.use("/v1/user", userRouter);
app.use("/v1/conversation", conversationRouter);
app.use("/v1/user-contact", userContactRouter);
app.use("/v1/notification", messageNotificationRouter);

//when user type a route doesn't exist
//it show error
app.use((req, res, next) => {
  return next(createError(404, "this route does not exist."));
});

app.use((err, req, res, next) => {
  return res.json({
    status: err.status || 404,
    message: err.message,
  });
});

///socket-io connection
global._io.on("connection", socketService.connection);
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`server running on port::::: ${PORT}`);
});
