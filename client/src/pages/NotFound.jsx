import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const Message = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  max-width: 600px;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Title>404</Title>
      <Message>
        Oops! The page you're looking for doesn't exist or has been moved.
      </Message>
      <HomeButton to="/">
        Return to Home
      </HomeButton>
    </NotFoundContainer>
  );
};

export default NotFound;
