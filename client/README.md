# Live Poll Battle - Client

This is the frontend client for the Live Poll Battle application, a real-time polling system that allows users to create and join poll rooms to vote on multiple-choice questions.

## Features

- **User Authentication**: 
  - Simple username-based authentication (no password)
  - Persistent login across page refreshes

- **Advanced Poll Creation**: 
  - Create custom poll rooms with personalized questions
  - Support for 2-5 options per poll
  - Drag and drop interface to reorder options
  - Customizable poll duration (1 hour to 2 days)

- **Streamlined Room Sharing**: 
  - Join existing rooms via 6-character room code
  - Direct share links for one-click joining
  - Copy buttons for both room code and share URL

- **Enhanced Voting Experience**: 
  - Clean, focused interface for decision making
  - Results hidden until after voting to prevent bias
  - Clear highlighting of user's selected option
  - Winning option visually distinguished with green highlighting

- **Real-time Updates**: 
  - Live vote counts and percentages
  - Dynamic progress bars for visual comparison
  - Instant synchronization across all connected users
  - Human-readable timer display (days, hours, minutes, seconds)

- **Responsive Design**: 
  - Optimized layouts for desktop and mobile devices
  - Adaptive grid system for multiple poll options
  - Touch-friendly interface elements

- **Persistent State**: 
  - Local storage for user information
  - Vote history across multiple polls
  - Automatic reconnection handling

## Technical Implementation

The client is built with a modern React stack:

- **React (18+)** with Vite for fast development and optimized builds
- **React Router (v6)** for declarative routing and navigation
- **Socket.io Client** for robust WebSocket communication
  - Automatic reconnection handling
  - Transport fallback mechanisms
  - Room-based event subscription
- **Styled Components** for component-based styling
  - Theming with CSS variables
  - Responsive design primitives
  - Dynamic styling based on component state
- **Context API** for efficient state management
  - User context for authentication state
  - Socket context for connection management
- **React Beautiful DnD** for drag and drop functionality
  - StrictMode compatibility
  - Accessible keyboard navigation
- **Local Storage API** for client-side persistence

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

The client will run on port 3000 by default.

## Building for Production

To build the client for production:

```
npm run build
```

This will create a `dist` directory with the production-ready build.

## License

ISC
