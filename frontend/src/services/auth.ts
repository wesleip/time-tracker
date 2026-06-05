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
