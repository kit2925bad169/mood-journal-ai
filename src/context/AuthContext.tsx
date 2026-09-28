import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import { User } from '../types.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    identifier: string,
    pass: string
  ) => Promise<void>;

  loginSupporter: (
    identifier: string,
    pass: string
  ) => Promise<void>;

  register: (data: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    confirmPassword?: string;
  }) => Promise<void>;

  loginDemo: () => Promise<void>;

  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem(
        'mood_journal_token'
      )
    );

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken =
        localStorage.getItem(
          'mood_journal_token'
        );

      if (storedToken) {
        try {
          const res =
            await api.getMe();

          setUser(res.user);
        } catch {
          localStorage.removeItem(
            'mood_journal_token'
          );

          setToken(null);
          setUser(null);
        }
      }

      setIsLoading(false);
    }

    loadUser();
  }, []);

  /* ----------------------------------------------------------
     NORMAL USER LOGIN
     ---------------------------------------------------------- */

  const login = async (
    identifier: string,
    pass: string
  ) => {
    const res = await api.login(
      identifier,
      pass
    );

    localStorage.setItem(
      'mood_journal_token',
      res.token
    );

    setToken(res.token);
    setUser(res.user);
  };

  /* ----------------------------------------------------------
     SUPPORTER LOGIN
     ---------------------------------------------------------- */

  const loginSupporter = async (
    identifier: string,
    pass: string
  ) => {
    const res =
      await api.loginSupporter(
        identifier,
        pass
      );

    if (res.user.role !== 'supporter') {
      throw new Error(
        'This account is not a supporter account.'
      );
    }

    localStorage.setItem(
      'mood_journal_token',
      res.token
    );

    setToken(res.token);
    setUser(res.user);
  };

  /* ----------------------------------------------------------
     REGISTER USER
     ---------------------------------------------------------- */

  const register = async (data: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    confirmPassword?: string;
  }) => {
    const res =
      await api.register(data);

    localStorage.setItem(
      'mood_journal_token',
      res.token
    );

    setToken(res.token);
    setUser(res.user);
  };

  /* ----------------------------------------------------------
     DEMO USER
     ---------------------------------------------------------- */

  const loginDemo = async () => {
    await login(
      'demo@moodjournal.ai',
      'Password123!'
    );
  };

  /* ----------------------------------------------------------
     LOGOUT
     ---------------------------------------------------------- */

  const logout = () => {
    localStorage.removeItem(
      'mood_journal_token'
    );

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginSupporter,
        register,
        loginDemo,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
};