import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2.5rem;
  color: var(--text-secondary);
  text-align: center;
  max-width: 600px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--primary-hover);
    }
  }
  
  &.secondary {
    background-color: var(--secondary-color);
    color: white;
    
    &:hover {
      background-color: var(--secondary-hover);
    }
  }
`;

const UserInfo = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: rgba(79, 70, 229, 0.1);
  border-radius: var(--border-radius);
  text-align: center;
`;

const Home = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <HomeContainer>
      <Title>Live Poll Battle</Title>
      <Subtitle>
        Create or join a poll room and vote in real-time. Watch as results update instantly!
      </Subtitle>
      
      {user && (
        <UserInfo>
          <p>Logged in as <strong>{user.username}</strong></p>
        </UserInfo>
      )}
      
      <ButtonContainer>
        <ActionButton to="/create" className="primary">
          Create a Poll
        </ActionButton>
        <ActionButton to="/join" className="secondary">
          Join a Poll
        </ActionButton>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default Home;
