const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // In production, specify your frontend URL
    methods: ['GET', 'POST']
  }
});

// Store for active poll rooms
const rooms = new Map();

// Route to get all active rooms
app.get('/api/rooms', (req, res) => {
  const roomList = Array.from(rooms.entries()).map(([id, room]) => ({
    id,
    question: room.question,
    options: room.options,
    totalVotes: room.votes.option1 + room.votes.option2,
    isActive: room.isActive
  }));
  
  res.json(roomList);
});

// Route to get specific room data
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  
  if (!rooms.has(roomId)) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const room = rooms.get(roomId);
  res.json({
    id: roomId,
    question: room.question,
    options: room.options,
    votes: room.votes,
    isActive: room.isActive,
    timeRemaining: room.timeRemaining,
    timerDuration: room.timerDuration || 60
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Create a new poll room
  socket.on('create_room', ({ username, question, options, duration }) => {
    const roomId = uuidv4().substring(0, 6).toUpperCase(); // Short, readable room code
    
    // Validate options format and convert if needed
    let formattedOptions = options;
    let formattedVotes = {};
    
    // If options is an array, convert to object format
    if (Array.isArray(options)) {
      formattedOptions = {};
      options.forEach((option, index) => {
        const key = `option${index + 1}`;
        formattedOptions[key] = option;
        formattedVotes[key] = 0;
      });
    } else if (!options) {
      // Default options
      formattedOptions = { option1: 'Cats', option2: 'Dogs' };
      formattedVotes = { option1: 0, option2: 0 };
    } else {
      // Initialize votes for each option
      Object.keys(options).forEach(key => {
        formattedVotes[key] = 0;
      });
    }
    
    // Set timer duration (default to 3600 seconds/1 hour if not specified)
    // Min: 3600 seconds (1 hour), Max: 172800 seconds (2 days)
    let timerDuration = 3600; // Default 1 hour
    if (duration && !isNaN(parseInt(duration))) {
      const requestedDuration = parseInt(duration);
      timerDuration = Math.max(3600, Math.min(172800, requestedDuration));
    }
    
    // For testing purposes, allow shorter durations if explicitly set to less than 3600
    if (duration && !isNaN(parseInt(duration)) && parseInt(duration) < 3600) {
      timerDuration = Math.max(60, parseInt(duration)); // Minimum 60 seconds for testing
    }
    
    // Create room with initial state
    const roomData = {
      creator: username,
      question: question || 'Cats vs Dogs?',
      options: formattedOptions,
      votes: formattedVotes,
      users: new Map([[socket.id, { username, voted: false }]]),
      isActive: true,
      timeRemaining: timerDuration,
      timerDuration: timerDuration,
      timer: null,
      createdAt: new Date().toISOString()
    };
    
    // Log room creation
    console.log(`Creating room ${roomId} with timeRemaining=${timerDuration}`);
    
    // Store room data
    rooms.set(roomId, roomData);
    
    // Join the room
    socket.join(roomId);
    
    // Start countdown timer after a brief delay to ensure room is fully set up
    setTimeout(() => {
      startRoomTimer(roomId);
    }, 100);
    
    // Send room info back to creator
    socket.emit('room_created', {
      roomId,
      question: roomData.question,
      options: roomData.options,
      timeRemaining: roomData.timeRemaining,
      timerDuration: roomData.timerDuration,
      isActive: roomData.isActive
    });
    
    console.log(`Room created: ${roomId} by ${username}`);
  });
  
  // Join an existing poll room
  socket.on('join_room', ({ roomId, username }) => {
    roomId = roomId.toUpperCase();
    
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const room = rooms.get(roomId);
    
    if (!room.isActive) {
      socket.emit('error', { message: 'This poll has ended' });
      return;
    }
    
    // Add user to room
    room.users.set(socket.id, { username, voted: false });
    
    // Join the socket room
    socket.join(roomId);
    
    // Send current room state to the joining user
    socket.emit('room_joined', {
      roomId,
      question: room.question,
      options: room.options,
      votes: room.votes,
      timeRemaining: room.timeRemaining,
      timerDuration: room.timerDuration,
      isActive: room.isActive
    });
    
    // Notify others that a new user joined
    socket.to(roomId).emit('user_joined', { username });
    
    console.log(`User ${username} joined room ${roomId}`);
  });
  
  // Handle vote submission
  socket.on('submit_vote', ({ roomId, option }) => {
    roomId = roomId.toUpperCase();
    
    if (!rooms.has(roomId)) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const room = rooms.get(roomId);
    
    if (!room.isActive) {
      socket.emit('error', { message: 'This poll has ended' });
      return;
    }
    
    const user = room.users.get(socket.id);
    
    if (!user) {
      socket.emit('error', { message: 'User not found in room' });
      return;
    }
    
    if (user.voted) {
      socket.emit('error', { message: 'You have already voted' });
      return;
    }
    
    // Record vote
    room.votes[option]++;
    user.voted = true;
    user.votedFor = option;
    
    // Broadcast updated votes to all users in the room
    io.to(roomId).emit('vote_update', {
      votes: room.votes
    });
    
    // Confirm vote to the voter
    socket.emit('vote_confirmed', {
      option,
      votes: room.votes
    });
    
    console.log(`Vote recorded in room ${roomId} for ${option}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find rooms the user was in and clean up
    for (const [roomId, room] of rooms.entries()) {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id);
        
        // If room is empty, clean it up
        if (room.users.size === 0) {
          clearInterval(room.timer);
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        }
      }
    }
  });
});

// Function to start and manage room timer
function startRoomTimer(roomId) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  // Prevent multiple timers for the same room
  if (room.timer) {
    console.log(`Timer already exists for room ${roomId}`);
    return;
  }
  
  console.log(`Starting timer for room ${roomId} with duration ${room.timerDuration} seconds`);
  
  // Make sure timeRemaining is properly set
  if (room.timeRemaining <= 0 || room.timeRemaining === undefined) {
    room.timeRemaining = room.timerDuration || 3600;
    console.log(`Reset timeRemaining to ${room.timeRemaining}`);
  }
  
  // For long durations, we don't need to update every second
  // Update every minute if duration > 1 hour, but use seconds for testing
  const updateInterval = 1; // Always use 1 second for now for reliability
  
  room.timer = setInterval(() => {
    // Decrement by the update interval
    room.timeRemaining -= updateInterval;
    
    // Log every 10 seconds for debugging
    if (room.timeRemaining % 10 === 0) {
      console.log(`Room ${roomId} time remaining: ${room.timeRemaining}s`);
    }
    
    // Broadcast time update
    io.to(roomId).emit('time_update', { timeRemaining: room.timeRemaining });
    
    // End poll when timer reaches zero
    if (room.timeRemaining <= 0) {
      clearInterval(room.timer);
      room.isActive = false;
      
      // Broadcast poll ended event
      io.to(roomId).emit('poll_ended', {
        finalVotes: room.votes
      });
      
      console.log(`Poll ended in room ${roomId}`);
      
      // Keep room data for a while before cleanup
      setTimeout(() => {
        if (rooms.has(roomId)) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (expired)`);
        }
      }, 3600000); // Clean up after 1 hour
    }
  }, updateInterval * 1000);
}

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
