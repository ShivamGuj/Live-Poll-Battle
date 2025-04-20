import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('pollUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('pollUser');
      }
    }
    setLoading(false);
  }, []);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('pollUser', JSON.stringify(user));
    }
  }, [user]);

  const login = (username) => {
    const newUser = {
      username,
      joinedAt: new Date().toISOString(),
    };
    setUser(newUser);
    return newUser;
  };

  const updateUserVote = (roomId, option) => {
    setUser((prevUser) => {
      if (!prevUser) return null;

      // Create or update the votes object
      const votes = { ...(prevUser.votes || {}) };
      votes[roomId] = option;

      return {
        ...prevUser,
        votes,
      };
    });
  };

  const hasVoted = (roomId) => {
    return user?.votes && roomId in user.votes;
  };

  const getVote = (roomId) => {
    return user?.votes?.[roomId] || null;
  };

  const logout = () => {
    localStorage.removeItem('pollUser');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUserVote, 
      hasVoted, 
      getVote 
    }}>
      {children}
    </UserContext.Provider>
  );
};
