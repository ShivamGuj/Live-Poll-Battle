import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import PollRoom from './pages/PollRoom';
import NotFound from './pages/NotFound';
import { SocketProvider } from './contexts/SocketContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateRoom />} />
            <Route path="/join" element={<JoinRoom />} />
            <Route path="/room/:roomId" element={<PollRoom />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </div>
      </SocketProvider>
    </UserProvider>
  );
}

export default App;
