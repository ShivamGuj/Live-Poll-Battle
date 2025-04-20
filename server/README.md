# Live Poll Battle - Server

This is the backend server for the Live Poll Battle application, a real-time polling system that allows users to create and join poll rooms to vote on multiple-choice questions.

## Features

- **Enhanced Room Management**: 
  - Create and join poll rooms with unique 6-character room codes
  - Support for 2-5 options per poll question
  - Custom poll durations from 1 hour to 2 days
  - Optimized in-memory storage using JavaScript Map objects

- **Real-time Communication**: 
  - Instant vote updates using WebSockets (Socket.io)
  - Efficient broadcasting to specific rooms
  - Connection recovery and fallback mechanisms

- **Flexible Timer System**:
  - Customizable countdown timer (1 hour to 2 days)
  - Optimized update intervals for long-running polls
  - Automatic poll closing when timer expires

- **Robust User Tracking**: 
  - Prevents multiple votes from the same user
  - Maintains connection state across socket reconnections
  - Supports users participating in multiple rooms

- **RESTful API**: Endpoints to retrieve room information and status

## Technical Implementation

### Vote State Sharing and Room Management

The server uses an in-memory data structure (JavaScript Map) to store room information, including:
- Room details (question, multiple options)
- Vote counts for each option
- Connected users and their voting status
- Room status (active/inactive)
- Timer configuration (custom duration, remaining time)
- Room lifecycle state (creation time, expiration handling)

The architecture emphasizes efficient real-time communication:
- WebSockets (via Socket.io) for low-latency bidirectional communication
- Room-based broadcasting to minimize unnecessary network traffic
- Optimized update intervals based on timer duration
- Validation of all incoming votes and user actions
- Built-in error handling and recovery mechanisms

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

The server will run on port 5001 by default. You can change this by setting the PORT environment variable.

## API Endpoints

- `GET /api/rooms` - Get list of all active rooms
- `GET /api/rooms/:roomId` - Get details for a specific room

## WebSocket Events

### Client to Server
- `create_room` - Create a new poll room with customizable options and duration
- `join_room` - Join an existing poll room using room code
- `submit_vote` - Submit a vote for one of the available options

### Server to Client
- `room_created` - Confirmation of room creation with room details
- `room_joined` - Confirmation of joining a room with current state
- `vote_update` - Real-time vote count updates across all options
- `time_update` - Countdown timer updates (interval varies by duration)
- `poll_ended` - Notification when poll ends with final results
- `user_joined` - Notification when a new user joins the room
- `vote_confirmed` - Personal confirmation of vote registration
- `error` - Detailed error messages with context

### Connection Management
- Automatic reconnection with state recovery
- Transport fallback (WebSocket → HTTP long-polling)
- Connection status notifications

## License

ISC
