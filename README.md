# Live Poll Battle

A real-time polling application that allows users to create or join poll rooms and vote live. The results update instantly across all users in the same room.

## Features

- **User Authentication**: Simple username-based authentication (no password required)
- **Enhanced Poll Creation**:
  - Create custom poll rooms with your own questions
  - Support for 2-5 options per poll
  - Drag and drop interface to reorder options
  - Customizable poll duration (1 hour to 2 days)
- **Streamlined Sharing**:
  - Easy-to-remember 6-character room codes
  - Direct share links for instant joining
  - Copy functionality for both room code and share URL
- **Interactive Voting Experience**:
  - Clean interface focused on making choices
  - Results appear only after voting to prevent bias
  - User's vote is clearly highlighted
  - Winning option visually distinguished with green highlighting
- **Real-time Updates**:
  - Instant vote count updates across all connected users
  - Live percentage calculations
  - Automatic poll closing when timer expires
- **Persistent State**:
  - Local storage to maintain user votes across page refreshes
  - Support for multiple concurrent poll rooms
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React with Vite
  - React Router for navigation
  - Socket.io Client for WebSocket communication
  - Styled Components for styling
  - Context API for state management
  - React Beautiful DnD for drag and drop functionality
  - Local Storage API for persisting data

- **Backend**: Node.js with Express
  - Socket.io for real-time WebSocket communication
  - UUID for unique room code generation
  - In-memory data storage with Map structures

## Project Structure

The project is organized into two main directories:

- `client/`: Contains the React frontend code
- `server/`: Contains the Node.js backend code

## Vote State Sharing and Room Management

The application uses WebSockets (Socket.io) to handle real-time communication between clients and the server. Here's how the vote state sharing and room management work:

- **Room Management**: 
  - Rooms are stored in an in-memory Map on the server
  - Each room has a unique 6-character ID for easy sharing
  - Room state includes question, options (2-5), votes, connected users, timer, and status
  - Optimized for quick access and real-time updates

- **Vote State Sharing**: 
  - When a user votes, the vote is sent to the server via WebSockets
  - Server validates the vote, updates the room state, and broadcasts to all users
  - All connected clients receive instant updates through Socket.io events
  - Percentage calculations are performed client-side for efficiency

- **User Tracking**: 
  - Server maintains user connection state and voting status
  - Prevents multiple votes from the same user in a room
  - Client uses local storage to persist votes across page refreshes
  - Users can participate in multiple rooms simultaneously

- **Room Lifecycle**: 
  - Each room has a customizable timer (1 hour to 2 days)
  - Server sends periodic time updates to all connected clients
  - When timer expires, room is marked inactive and voting is disabled
  - Room data is maintained for an hour after completion for result viewing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser with WebSocket support

### Installation and Running

1. Clone the repository
    ```bash
    git clone git@github.com:ShivamGuj/Live-Poll-Battle.git
    ```
2. Install dependencies for both client and server:

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Start the server:

   ```bash
   # From the server directory
   npm start
   ```

4. Start the client:

   ```bash
   # From the client directory
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Create a Poll**:
   - Enter your name
   - Enter a question
   - Enter two options
   - Click "Create Poll"

2. **Join a Poll**:
   - Enter your name
   - Enter the 6-character room code
   - Click "Join Poll"

3. **Vote in a Poll**:
   - Click on one of the two options to cast your vote
   - Watch as the results update in real-time
   - The poll will automatically end after 60 seconds

## License

ISC
