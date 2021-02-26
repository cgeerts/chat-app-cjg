const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./components/messages');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./components/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const colorPalette = {
  "black": {
    "main": '#2b2b2b',
    "sub": '#808080',
  },
  "green": {
    "main": '#0e8501',
    "sub": "#7fd975",
  },
  "blue": {
    "main": '#626abd',
    "sub": '#7b9ce3',
  },
  "red": {
    "main": '#d94f45',
    "sub": '#e68e8e',
  },
}

app.use(express.static(path.join(__dirname, 'public')));

// Client connection
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(`${user.username} joined the room`)
      );

    // Send room information
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Listen for colourSwap
  socket.on('colourSwapClient', (color) => {
    const user = getCurrentUser(socket.id);

    const trueColor = colorPalette[color.color];

    io.to(user.room).emit('colorSwap', {trueColor});
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(`${user.username} has left the room`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 5050;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
