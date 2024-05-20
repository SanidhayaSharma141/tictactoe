// Importing modules
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = require("socket.io")(server);

// Middlewares
app.use(express.json());

// Database connection
const DB = "mongodb+srv://sanidhyas141:vHmTfqbv6B2uLcZv@cluster0.yhwivpp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(DB)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// Socket.io event listeners
io.on("connection", (socket) => {
  console.log("A user connected!");

  // Event listener for creating a room
  socket.on("addRoom", async ({ nickname }) => {
    try {
      let room = new Room({
        players: [{
          socketID: socket.id,
          nickname,
          playerType: "X"
        }],
        turn: {
          socketID: socket.id,
          nickname,
          playerType: "X"
        }
      });
      room = await room.save();
      const roomId = room._id.toString();
      socket.join(roomId);
      io.to(roomId).emit("addRoomSuccessful", room);
    } catch (error) {
      console.error("Error adding room:", error);
    }
  });

  // Event listener for joining a room
  socket.on("enterRoom", async ({ nickname, roomId }) => {
    try {
      // Check if the room ID is valid
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        socket.emit("errorOccurred", "Please enter a valid room ID.");
        return;
      }
      let room = await Room.findById(roomId);

      if (room.isJoin) {
        const player = {
          nickname,
          socketID: socket.id,
          playerType: "O"
        };
        socket.join(roomId);
        room.players.push(player);
        room.isJoin = false;
        room = await room.save();
        io.to(roomId).emit("enterRoomSuccessful", room);
        io.to(roomId).emit("updatePlayers", room.players);
        io.to(roomId).emit("updateRoom", room);
      } else {
        socket.emit("errorOccurred", "The game is in progress, try again later.");
      }
    } catch (error) {
      console.error("Error entering room:", error);
    }
  });

  // Event listener for grid tap
  socket.on("tap", async ({ index, roomId }) => {
    try {
      let room = await Room.findById(roomId);
      let choice = room.turn.playerType; // X or O
      room.turn = room.players.find(player => player.socketID !== room.turn.socketID);
      room = await room.save();
      io.to(roomId).emit("tapped", { index, choice, room });
    } catch (error) {
      console.error("Error handling tap:", error);
    }
  });

  // Event listener for winner
  socket.on("winner", async ({ winnerSocketId, roomId }) => {
    try {
      let room = await Room.findById(roomId);
      let player = room.players.find(player => player.socketID === winnerSocketId);
      player.points += 1;
      room = await room.save();
      if (player.points >= room.maxRounds) {
        io.to(roomId).emit("endGame", player);
      } else {
        io.to(roomId).emit("pointIncrease", player);
      }
    } catch (error) {
      console.error("Error handling winner:", error);
    }
  });
});

// Start the server
server.listen(port, "0.0.0.0", () => {
  console.log(`Server started and running on port ${port}`);
});
