import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useUser } from '../contexts/UserContext';
import styled from 'styled-components';

const PollRoomContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
`;

const RoomHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomTitle = styled.h1`
  font-size: 1.75rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const RoomCode = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const RoomCodeLabel = styled.span`
  font-weight: 600;
  color: var(--text-secondary);
`;

const RoomCodeValue = styled.span`
  background-color: rgba(79, 70, 229, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-weight: 600;
  letter-spacing: 1px;
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ShareSection = styled.div`
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ShareInput = styled.input`
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 300px;
  font-family: monospace;
`;

const Timer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => props.$isEnding ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius);
  font-weight: 600;
  color: ${props => props.$isEnding ? 'var(--error-color)' : 'var(--success-color)'};
`;

const PollCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Question = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: ${props => props.$optionCount > 2 ? '1fr 1fr 1fr' : '1fr 1fr'};
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: ${props => props.$optionCount > 2 ? '1fr 1fr' : '1fr 1fr'};
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const OptionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
  background-color: ${props => 
    props.selected 
      ? 'rgba(79, 70, 229, 0.1)' 
      : props.disabled 
        ? 'rgba(243, 244, 246, 0.5)' 
        : 'white'
  };
  border: 2px solid ${props => {
    if (props.selected) return 'var(--primary-color)';
    if (props.$isWinner) return 'var(--success-color)';
    return props.disabled ? 'var(--border-color)' : 'var(--border-color)';
  }};
  border-radius: var(--border-radius);
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => {
      if (props.disabled) return props.$isWinner ? 'var(--success-color)' : 'var(--border-color)';
      return 'var(--primary-color)';
    }};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`;

const OptionText = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
`;

const OptionPercentage = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${props => props.$isWinner ? 'var(--success-color)' : 'var(--text-secondary)'};
  margin-top: 0.5rem;
  position: relative;
  z-index: 2;
`;

const OptionBackground = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: ${props => props.$isWinner ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)'};
  transition: all 0.3s ease;
  z-index: 1;
`;

const VoteStatus = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
  font-weight: 500;
  color: ${props => props.$voted ? 'var(--success-color)' : 'var(--text-secondary)'};
`;

const ResultsCard = styled.div`
  background-color: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
`;

const ResultsTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ProgressContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const OptionLabel = styled.span`
  font-weight: 600;
`;

const VoteCount = styled.span`
  color: var(--text-secondary);
`;

const ProgressBar = styled.div`
  height: 1.5rem;
  background-color: #f3f4f6;
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: ${props => props.option === 'option1' ? 'var(--primary-color)' : 'var(--secondary-color)'};
  border-radius: 9999px;
  transition: width 0.5s ease;
`;

const TotalVotes = styled.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
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

const PollRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { socket, connected } = useSocket();
  const { user, hasVoted, getVote, updateUserVote } = useUser();
  
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(3600); // Default to 1 hour
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  
  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/join', { state: { roomId } });
    }
  }, [user, navigate, roomId]);
  
  // Generate share URL
  useEffect(() => {
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/join?roomId=${roomId}`);
  }, [roomId]);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !connected || !user) return;
    
    // Check if user has already voted in this room (from localStorage)
    if (hasVoted(roomId)) {
      setSelectedOption(getVote(roomId));
    }
    
    // Join the room
    if (!room) {
      socket.emit('join_room', {
        roomId,
        username: user.username
      });
    }
    
    // Handle room joined event
    const handleRoomJoined = (data) => {
      console.log('Room joined data:', data);
      setRoom(data);
      if (data.timeRemaining !== undefined && data.timeRemaining > 0) {
        console.log(`Setting initial timeRemaining to ${data.timeRemaining}`);
        setTimeRemaining(data.timeRemaining);
      } else {
        // Fallback to default if timeRemaining is not valid
        console.log(`Invalid timeRemaining (${data.timeRemaining}), using default`);
        setTimeRemaining(data.timerDuration || 3600);
      }
    };
    
    // Handle vote updates
    const handleVoteUpdate = (data) => {
      setRoom(prev => ({
        ...prev,
        votes: data.votes
      }));
    };
    
    // Handle time updates
    const handleTimeUpdate = (data) => {
      console.log(`Time update received: ${data.timeRemaining}s remaining`);
      if (data.timeRemaining !== undefined && data.timeRemaining >= 0) {
        setTimeRemaining(data.timeRemaining);
      }
    };
    
    // Handle poll ended
    const handlePollEnded = (data) => {
      setRoom(prev => ({
        ...prev,
        isActive: false,
        votes: data.finalVotes
      }));
      setTimeRemaining(0);
    };
    
    // Handle errors
    const handleError = (data) => {
      setError(data.message);
      
      // If room not found, redirect to home
      if (data.message === 'Room not found' || data.message === 'This poll has ended') {
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };
    
    // Register event listeners
    socket.on('room_joined', handleRoomJoined);
    socket.on('vote_update', handleVoteUpdate);
    socket.on('time_update', handleTimeUpdate);
    socket.on('poll_ended', handlePollEnded);
    socket.on('error', handleError);
    
    // Clean up event listeners
    return () => {
      socket.off('room_joined', handleRoomJoined);
      socket.off('vote_update', handleVoteUpdate);
      socket.off('time_update', handleTimeUpdate);
      socket.off('poll_ended', handlePollEnded);
      socket.off('error', handleError);
    };
  }, [socket, connected, user, roomId, room, navigate, hasVoted, getVote]);
  
  // Handle vote submission
  const handleVote = (option) => {
    if (!socket || !connected || !room?.isActive || selectedOption) return;
    
    setSelectedOption(option);
    
    // Submit vote via socket
    socket.emit('submit_vote', {
      roomId,
      option
    });
    
    // Update local storage
    updateUserVote(roomId, option);
    
    // Listen for vote confirmation
    socket.once('vote_confirmed', (data) => {
      // Vote confirmed by server
    });
  };
  
  // Copy room code to clipboard
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Copy share link to clipboard
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  // Format time remaining in a user-friendly way
  const formatTimeRemaining = (seconds) => {
    if (seconds === null || seconds === undefined || seconds <= 0) return 'Ended';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    let timeString = '';
    
    if (days > 0) {
      timeString += `${days}d `;
    }
    
    if (hours > 0 || days > 0) {
      timeString += `${hours}h `;
    }
    
    if (minutes > 0 || hours > 0 || days > 0) {
      timeString += `${minutes}m `;
    }
    
    // Only show seconds if less than 1 hour remains
    if (seconds < 3600) {
      timeString += `${remainingSeconds}s`;
    }
    
    return timeString.trim();
  };
  
  // Calculate vote percentages
  const calculatePercentage = (option) => {
    if (!room) return 0;
    
    const totalVotes = Object.values(room.votes).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    return Math.round((room.votes[option] / totalVotes) * 100);
  };
  
  // Find the option with the highest percentage
  const findWinningOption = () => {
    if (!room) return null;
    
    let maxVotes = -1;
    let winningOption = null;
    
    Object.entries(room.votes).forEach(([option, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winningOption = option;
      }
    });
    
    return winningOption;
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/');
  };
  
  // Show loading state
  if (!room) {
    return (
      <PollRoomContainer>
        <BackButton onClick={handleBack}>
          ← Back to Home
        </BackButton>
        <PollCard>
          <div className="text-center">Loading poll room...</div>
        </PollCard>
      </PollRoomContainer>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <PollRoomContainer>
        <BackButton onClick={handleBack}>
          ← Back to Home
        </BackButton>
        <PollCard>
          <div className="text-center">
            <p style={{ color: 'var(--error-color)' }}>{error}</p>
            <p>Redirecting to home page...</p>
          </div>
        </PollCard>
      </PollRoomContainer>
    );
  }
  
  return (
    <PollRoomContainer>
      <BackButton onClick={handleBack}>
        ← Back to Home
      </BackButton>
      
      <RoomHeader>
        <RoomInfo>
          <RoomTitle>Live Poll</RoomTitle>
          <RoomCode>
            <RoomCodeLabel>Room Code:</RoomCodeLabel>
            <RoomCodeValue>{roomId}</RoomCodeValue>
            <CopyButton onClick={copyRoomCode}>
              {copied ? 'Copied!' : 'Copy'}
            </CopyButton>
          </RoomCode>
          
          <ShareSection>
            <RoomCodeLabel>Share:</RoomCodeLabel>
            <ShareInput 
              type="text" 
              value={shareUrl} 
              readOnly 
              onClick={(e) => e.target.select()}
            />
            <CopyButton onClick={copyShareLink}>
              {linkCopied ? 'Copied!' : 'Copy Link'}
            </CopyButton>
          </ShareSection>
        </RoomInfo>
        
        <Timer $isEnding={timeRemaining !== null && timeRemaining <= 300}> {/* Show warning when less than 5 minutes remain */}
          {room && room.isActive 
            ? `Time Remaining: ${formatTimeRemaining(timeRemaining)}` 
            : 'Poll Ended'}
        </Timer>
      </RoomHeader>
      
      <PollCard>
        <Question>{room.question}</Question>
        
        <OptionsContainer $optionCount={Object.keys(room.options).length}>
          {Object.entries(room.options).map(([key, value]) => {
            const percentage = calculatePercentage(key);
            const isWinner = findWinningOption() === key;
            
            return (
              <OptionButton 
                key={key}
                onClick={() => handleVote(key)}
                selected={selectedOption === key}
                disabled={!room.isActive || selectedOption !== null}
                $isWinner={selectedOption !== null && isWinner}
              >
                {/* Only show a highlight for the selected option, not percentage fill */}
                {selectedOption === key && (
                  <OptionBackground 
                    $percentage={100} 
                    $isWinner={false}
                    style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                  />
                )}
                <OptionText>{value}</OptionText>
                {/* No percentage text on options anymore - users can see results below */}
              </OptionButton>
            );
          })}
        </OptionsContainer>
        
        <VoteStatus $voted={selectedOption !== null}>
          {selectedOption 
            ? `You voted for ${room.options[selectedOption]}` 
            : room.isActive 
              ? 'Click an option to vote. Results will be visible after voting.' 
              : 'Voting has ended'}
        </VoteStatus>
      </PollCard>
      
      {/* Show detailed results card ONLY AFTER the user has voted */}
      {selectedOption && (
        <ResultsCard>
          <ResultsTitle>Live Results</ResultsTitle>
          
          {Object.entries(room.options).map(([key, value]) => {
            const percentage = calculatePercentage(key);
            const isWinner = findWinningOption() === key;
            const isUserVote = selectedOption === key;
            
            return (
              <ProgressContainer key={key}>
                <ProgressLabel>
                  <OptionLabel 
                    style={{ 
                      color: isWinner ? 'var(--success-color)' : (isUserVote ? 'var(--primary-color)' : 'inherit'),
                      fontWeight: isUserVote ? '700' : '600',
                    }}
                  >
                    {value} {isUserVote && '(Your Vote)'}
                  </OptionLabel>
                  <VoteCount>{room.votes[key]} votes ({percentage}%)</VoteCount>
                </ProgressLabel>
                <ProgressBar>
                  <ProgressFill 
                    $percentage={percentage} 
                    option={key} 
                    style={{ 
                      backgroundColor: isWinner 
                        ? 'var(--success-color)' 
                        : (isUserVote ? 'var(--primary-color)' : null)
                    }}
                  />
                </ProgressBar>
              </ProgressContainer>
            );
          })}
          
          <TotalVotes>
            Total votes: {Object.values(room.votes).reduce((sum, count) => sum + count, 0)}
          </TotalVotes>
        </ResultsCard>
      )}
    </PollRoomContainer>
  );
};

export default PollRoom;
