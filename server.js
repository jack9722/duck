const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the current directory
app.use(express.static('./'));

// Store connected players
const players = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle player joining
    socket.on('playerJoin', (playerData) => {
        console.log(`Player ${socket.id} joined as ${playerData.name}`);
        
        // Store player data
        players[socket.id] = {
            id: socket.id,
            name: playerData.name,
            color: playerData.color,
            position: playerData.position || { x: 0, y: 1, z: 0 },
            rotation: playerData.rotation || { y: 0 },
            isMoving: false,
            isJumping: false
        };
        
        // Send existing players to the new player
        socket.emit('existingPlayers', players);
        
        // Broadcast new player to all other players
        socket.broadcast.emit('playerJoined', players[socket.id]);
    });
    
    // Handle player movement updates
    socket.on('playerUpdate', (playerData) => {
        if (players[socket.id]) {
            // Update player data
            players[socket.id].position = playerData.position;
            players[socket.id].rotation = playerData.rotation;
            players[socket.id].isMoving = playerData.isMoving;
            players[socket.id].isJumping = playerData.isJumping;
            
            // Broadcast player update to all other players
            socket.broadcast.emit('playerMoved', {
                id: socket.id,
                position: playerData.position,
                rotation: playerData.rotation,
                isMoving: playerData.isMoving,
                isJumping: playerData.isJumping
            });
        }
    });
    
    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        if (players[socket.id]) {
            // Broadcast player left to all other players
            io.emit('playerLeft', socket.id);
            
            // Remove player from players object
            delete players[socket.id];
        }
    });
    
    // Handle chat messages
    socket.on('chatMessage', (message) => {
        if (players[socket.id]) {
            // Broadcast chat message to all players
            io.emit('chatMessage', {
                id: socket.id,
                name: players[socket.id].name,
                message: message
            });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});