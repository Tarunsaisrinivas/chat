const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173","https://cnschat.netlify.app"],
    methods: ["POST", "PUT", "GET", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log(`user Connected: ${socket.id}`);

  socket.on("send_message",(data)=>{
    // console.log(data)
    socket.broadcast.emit("receive_message",data);
  })

});

server.listen(1419, () => {
  console.log("Server is running on port 1419");
});
