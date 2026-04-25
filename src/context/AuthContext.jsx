import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : error.message 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password, role: 'Participant' }, config);
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response && error.response.data.message 
          ? error.response.data.message 
          : error.message 
      };
    }
  };

  const logout = async () => {
    try {
      if (user?._id) {
        await axios.post(`${API_URL}/auth/logout`, { userId: user._id });
      }
    } catch (err) {
      console.error("Logout sync failed");
    }
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return { success: true, question: data.question };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const resetPassword = async (email, securityAnswer, newPassword) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/reset-password`, { email, securityAnswer, newPassword });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('userInfo', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, forgotPassword, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
