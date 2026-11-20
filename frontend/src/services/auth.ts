import api from "./client";
import type { User } from "../types";

interface Token {
  accessToken: string;
  tokenType: string;
}

export async function register(email: string, name: string, password: string): Promise<Token> {
  const { data } = await api.post<Token>("/auth/register", { email, name, password });
  return data;
}

export async function login(email: string, password: string): Promise<Token> {
  const { data } = await api.post<Token>("/auth/login", { email, password });
  return data;
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export async function logout(token: string): Promise<void> {
  // Token enviado explicitamente: o AuthContext limpa o localStorage antes desta chamada.
  await api.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
}
