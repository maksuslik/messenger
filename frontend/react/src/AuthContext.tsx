import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api'
});

export default api;

interface User {
  login: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoadingUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      let token = localStorage.getItem('authToken');
      let login;

      if (!token) {
        try {
          const response = await api.post('/auth/init');
          token = response.data.token;
          login = response.data.login;

          if(token) {
            localStorage.setItem('authToken', token);
            //localStorage.setItem('userLogin', login);
          }
        } catch (error) {
          console.error("Failed to register", error);
        }
      }

      console.log("token: " + token)

      if (token && login) {
        setUser({ token, login });
      }
      setIsLoadingUser(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoadingUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};