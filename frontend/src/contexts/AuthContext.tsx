import { useEffect, useState, type ReactNode } from "react";
import * as authService from "../services/auth";
import { clearToken, getToken, setToken } from "../services/client";
import { AuthContext } from "./auth-context";
import type { User } from "../types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Sem token não há o que validar: já nasce sem carregamento.
  const [isLoading, setIsLoading] = useState(() => localStorage.getItem("tt_token") !== null);

  useEffect(() => {
    const token = localStorage.getItem("tt_token");
    if (!token) return;

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
    const token = getToken();
    clearToken();
    setUser(null);
    // Revogação no servidor não pode travar a saída: token local já foi limpo.
    if (token) authService.logout(token).catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
