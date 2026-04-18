/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from 'react';

export const AuctionContext = createContext();

export const AuctionProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(
  localStorage.getItem("user") || null
);
  const[userName, setUserName] = useState(localStorage.getItem('userName') || null);

  const login = (newToken, newRole, userData,newUserName) => {
    setToken(newToken);
    setRole(newRole);
    setUser(userData);
    setUserName(newUserName);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("userName",newUserName)
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    setUserName(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('userName')
  };

  const isAuthenticated = !!token;

  const value = {
    token,
    role,
    user,
    userName,
    setUser,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuctionContext.Provider value={value}>
      {children}
    </AuctionContext.Provider>
  );
};
