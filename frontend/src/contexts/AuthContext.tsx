import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/auth";
import { clearToken, setToken } from "../services/client";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("tt_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { accessToken } = await authService.login(email, password);
    setToken(accessToken);
    const userData = await authService.me();
    setUser(userData);
  }

  async function register(email: string, name: string, password: string) {
    const { accessToken } = await authService.register(email, name, password);
    setToken(accessToken);
    const userData = await authService.me();
    setUser(userData);
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
