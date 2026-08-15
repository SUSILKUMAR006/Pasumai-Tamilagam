import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AuthContext = createContext(null);

const IDLE_LOGOUT_MS = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user details on initial application mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('tn_tree_token');
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
        } catch (error) {
          console.error('Failed to load profile on mount, logging out:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('tn_tree_token', res.token);
      
      // Fetch full profile info with counts
      const profile = await api.auth.me();
      setUser(profile);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.auth.register(userData);
      localStorage.setItem('tn_tree_token', res.token);
      
      const profile = await api.auth.me();
      setUser(profile);
      return profile;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('tn_tree_token');
    setUser(null);
    setLoading(false);
  };

  // Auto-logout after IDLE_LOGOUT_MS of no mouse/keyboard/touch activity
  useEffect(() => {
    if (!user) return;

    let timer;
    const handleIdleLogout = () => {
      logout();
      navigate('/login', { state: { idleLogout: true } });
    };
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(handleIdleLogout, IDLE_LOGOUT_MS);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!user]);

  const updateProfile = async (formData) => {
    try {
      const updatedUser = await api.auth.updateProfile(formData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};
