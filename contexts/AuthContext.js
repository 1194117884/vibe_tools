import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'auth_token';

function isTokenUsable(token) {
  if (!token || typeof token !== 'string') return false;

  try {
    const payloadPart = token.split('.')[1];
    if (!payloadPart) return false;
    const normalizedPayload = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=');
    const payload = JSON.parse(atob(normalizedPayload));
    if (!payload.exp) return true;
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isTokenUsable(stored)) {
      setToken(stored);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const verify = useCallback(async (key) => {
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        setToken(data.token);
        return null;
      }

      return data.error || '验证失败';
    } catch {
      return '验证服务暂时不可用，请稍后再试';
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  const isAuthenticated = isTokenUsable(token);

  return (
    <AuthContext.Provider value={{ isAuthenticated, verify, clearAuth, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
