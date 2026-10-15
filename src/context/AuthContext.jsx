import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getSessionToken, setSessionToken, getBackendBaseUrl, setBackendBaseUrl } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getSessionToken());
  const [backendUrl, setBackendUrlState] = useState(getBackendBaseUrl());
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isExchanging, setIsExchanging] = useState(false);

  // Check query parameter ?key=... on mount for 1-tap bootstrap pairing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const keyParam = urlParams.get('key');
    const backendParam = urlParams.get('backend');

    if (backendParam) {
      setBackendBaseUrl(backendParam);
      setBackendUrlState(backendParam);
    }

    if (keyParam) {
      handleExchange(keyParam).then(() => {
        // Strip ?key=... from address bar for security
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      });
    }
  }, []);

  // Listen for 401 token expiration
  useEffect(() => {
    const handleExpired = () => {
      setToken('');
      setAuthError('Your session has expired. Please enter your personal key to reconnect.');
      setIsPromptOpen(true);
    };

    window.addEventListener('auth_token_expired', handleExpired);
    return () => window.removeEventListener('auth_token_expired', handleExpired);
  }, []);

  const handleExchange = async (bootstrapKey) => {
    setIsExchanging(true);
    setAuthError('');
    try {
      const res = await api.exchangeBootstrapKey(bootstrapKey);
      if (res && res.access_token) {
        setToken(res.access_token);
        setIsPromptOpen(false);
        return true;
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid personal access key');
      return false;
    } finally {
      setIsExchanging(false);
    }
  };

  const updateBackendUrl = (newUrl) => {
    setBackendBaseUrl(newUrl);
    setBackendUrlState(newUrl);
  };

  const logout = () => {
    setSessionToken('');
    setToken('');
    setIsPromptOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: Boolean(token),
        backendUrl,
        updateBackendUrl,
        exchangeKey: handleExchange,
        isPromptOpen,
        setIsPromptOpen,
        authError,
        isExchanging,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
