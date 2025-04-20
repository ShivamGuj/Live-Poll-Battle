import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';
import styled from 'styled-components';
// Import with proper error handling for react-beautiful-dnd in StrictMode
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Fix for React 18 StrictMode compatibility
// This prevents the "Unable to find draggable with id" error
const StrictModeDroppable = ({ children, ...props }) => {
  const [enabled, setEnabled] = React.useState(false);
  
  React.useEffect(() => {
    // This is needed for react-beautiful-dnd to work in StrictMode
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);
  
  if (!enabled) {
    return null;
  }
  
  return <Droppable {...props}>{children}</Droppable>;
};

const CreateRoomContainer = styled.div`
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
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-hover);
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

const CreateRoom = () => {
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { id: 'option1', text: '' },
    { id: 'option2', text: '' }
  ]);
  const [duration, setDuration] = useState(3600); // Default: 1 hour (3600 seconds)
  const [durationUnit, setDurationUnit] = useState('hours'); // 'hours' or 'days'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { socket, connected } = useSocket();
  const { user, login } = useUser();
  const navigate = useNavigate();
  
  // Pre-fill username if user exists
  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);
  
  // Handle adding a new option (up to 5)
  const handleAddOption = () => {
    if (options.length < 5) {
      const newOptionId = `option${options.length + 1}`;
      setOptions([...options, { id: newOptionId, text: '' }]);
    }
  };

  // Handle removing an option (minimum 2)
  const handleRemoveOption = (id) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  // Handle option text change
  const handleOptionChange = (id, value) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text: value } : option
    ));
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result) => {
    // If dropped outside the list or no movement
    if (!result.destination || result.destination.index === result.source.index) {
      return;
    }
    
    console.log('Drag end:', result);
    
    const items = Array.from(options);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOptions(items);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    if (!question.trim()) {
      setError('Question is required');
      return;
    }
    
    // Check if all options have text
    const emptyOptions = options.filter(option => !option.text.trim());
    if (emptyOptions.length > 0) {
      setError('All options are required');
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
    
    // Format options for the server
    const formattedOptions = options.reduce((acc, option, index) => {
      acc[`option${index + 1}`] = option.text;
      return acc;
    }, {});
    
    // Create room via socket
    socket.emit('create_room', {
      username,
      question,
      options: formattedOptions,
      duration: duration
    });
    
    // Listen for room creation response
    socket.once('room_created', (data) => {
      setIsLoading(false);
      navigate(`/room/${data.roomId}`);
    });
    
    // Handle errors
    socket.once('error', (data) => {
      setIsLoading(false);
      setError(data.message || 'Failed to create room');
    });
  };
  
  const handleBack = () => {
    navigate('/');
  };
  
  return (
    <CreateRoomContainer>
      <BackButton onClick={handleBack}>
        ← Back to Home
      </BackButton>
      
      <FormCard>
        <Title>Create a New Poll</Title>
        
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
            <Label htmlFor="question">Poll Question</Label>
            <Input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., Cats vs Dogs?"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Poll Options (2-5)</Label>
            <DragDropContext onDragEnd={handleDragEnd}>
              <StrictModeDroppable droppableId="options">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ marginBottom: '1rem' }}
                  >
                    {options.map((option, index) => (
                      <Draggable key={option.id} draggableId={option.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '0.75rem',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div 
                              style={{ 
                                marginRight: '0.5rem', 
                                color: 'var(--text-secondary)',
                                cursor: 'grab',
                                padding: '0 0.5rem'
                              }}
                            >
                              ≡
                            </div>
                            <Input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(option.id, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              required
                              style={{ flex: 1 }}
                            />
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(option.id)}
                                style={{
                                  marginLeft: '0.5rem',
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--error-color)',
                                  cursor: 'pointer',
                                  fontSize: '1.25rem'
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </StrictModeDroppable>
            </DragDropContext>
            
            {options.length < 5 && (
              <button
                type="button"
                onClick={handleAddOption}
                style={{
                  background: 'none',
                  border: '1px dashed var(--border-color)',
                  borderRadius: 'var(--border-radius)',
                  padding: '0.5rem',
                  width: '100%',
                  color: 'var(--primary-color)',
                  cursor: 'pointer'
                }}
              >
                + Add Option
              </button>
            )}
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="duration">Poll Duration</Label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Input
                type="number"
                id="duration"
                value={durationUnit === 'hours' ? Math.round(duration / 3600) : Math.round(duration / 86400)}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  if (durationUnit === 'hours') {
                    // Convert hours to seconds (1-48 hours)
                    const hours = Math.max(1, Math.min(48, value));
                    setDuration(hours * 3600);
                  } else {
                    // Convert days to seconds (1-2 days)
                    const days = Math.max(1, Math.min(2, value));
                    setDuration(days * 86400);
                  }
                }}
                min={durationUnit === 'hours' ? "1" : "1"}
                max={durationUnit === 'hours' ? "48" : "2"}
                required
                style={{ flex: '1' }}
              />
              <select 
                value={durationUnit}
                onChange={(e) => {
                  const newUnit = e.target.value;
                  setDurationUnit(newUnit);
                  
                  // Adjust the duration value when switching units
                  if (newUnit === 'days' && duration < 86400) {
                    setDuration(86400); // Minimum 1 day
                  } else if (newUnit === 'hours' && duration > 172800) {
                    setDuration(172800); // Maximum 2 days
                  }
                }}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'white'
                }}
              >
                <option value="hours">Hours</option>
                <option value="days">Days</option>
              </select>
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>
              {durationUnit === 'hours' ? 'Min: 1 hour, Max: 48 hours' : 'Min: 1 day, Max: 2 days'}
            </small>
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={isLoading || !connected}>
            {isLoading ? 'Creating...' : 'Create Poll'}
          </Button>
        </Form>
      </FormCard>
    </CreateRoomContainer>
  );
};

export default CreateRoom;
