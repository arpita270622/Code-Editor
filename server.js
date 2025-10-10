const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: '*', // allow all origins
    methods: ['GET', 'POST'],
  },
});

// Store clients in rooms
const rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ socketId: socket.id, username });

    // Notify everyone in room about new client
    io.to(roomId).emit('joined', {
      clients: rooms[roomId],
      username,
      socketId: socket.id,
    });

    console.log(`${username} joined room ${roomId}`);
  });

  socket.on('code-change', ({ roomId, code }) => {
    socket.to(roomId).emit('code-change', { code });
  });

  socket.on('sync-code', ({ socketId, code }) => {
    io.to(socketId).emit('code-change', { code });
  });

  socket.on('disconnecting', () => {
    const roomsLeft = socket.rooms;
    roomsLeft.forEach((roomId) => {
      if (rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter(
          (client) => client.socketId !== socket.id
        );
        socket.to(roomId).emit('disconnected', {
          socketId: socket.id,
          username:
            rooms[roomId]?.find((c) => c.socketId === socket.id)?.username ||
            'Unknown',
        });
      }
    });
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(5000, () => console.log('Server running on port 5000'));
