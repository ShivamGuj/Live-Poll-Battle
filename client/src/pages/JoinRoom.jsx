import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';
import styled from 'styled-components';

const JoinRoomContainer = styled.div`
  max-width: 600px;
  margin: 3rem auto;
`;

const FormCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: var(--primary-color);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  text-transform: ${props => props.uppercase ? 'uppercase' : 'none'};
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background-color: var(--secondary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--secondary-hover);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const JoinRoom = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { socket, connected } = useSocket();
  const { user, login } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pre-fill username if user exists and get roomId from URL if available
  useEffect(() => {
    // Pre-fill username if user exists
    if (user) {
      setUsername(user.username);
    }
    
    // Check for roomId in URL query parameters
    const params = new URLSearchParams(location.search);
    const roomIdParam = params.get('roomId');
    if (roomIdParam) {
      setRoomId(roomIdParam.toUpperCase());
    }
  }, [user, location]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!roomId.trim()) {
      setError('Room code is required');
      return;
    }
    
    if (!connected || !socket) {
      setError('Not connected to server. Please try again.');
      return;
    }
    
    setIsLoading(true);
    
    // Login user if not already logged in
    if (!user) {
      login(username);
    }
    
    // Join room via socket
    socket.emit('join_room', {
      username,
      roomId: roomId.toUpperCase()
    });
    
    // Listen for room join response
    socket.once('room_joined', (data) => {
      setIsLoading(false);
      navigate(`/room/${data.roomId}`);
    });
    
    // Handle errors
    socket.once('error', (data) => {
      setIsLoading(false);
      setError(data.message || 'Failed to join room');
    });
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleRoomIdChange = (e) => {
    // Allow only alphanumeric characters and convert to uppercase
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setRoomId(value);
  };
  
  return (
    <JoinRoomContainer>
      <BackButton onClick={handleBack}>
        ← Back to Home
      </BackButton>
      
      <FormCard>
        <Title>Join a Poll</Title>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="username">Your Name</Label>
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="roomId">Room Code</Label>
            <Input
              type="text"
              id="roomId"
              value={roomId}
              onChange={handleRoomIdChange}
              placeholder="Enter 6-digit room code"
              maxLength={6}
              uppercase
              required
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={isLoading || !connected}>
            {isLoading ? 'Joining...' : 'Join Poll'}
          </Button>
        </Form>
      </FormCard>
    </JoinRoomContainer>
  );
};

export default JoinRoom;
