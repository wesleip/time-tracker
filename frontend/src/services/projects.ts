import api from "./client";
import type { Project } from "../types";

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<Project[]>("/projects/");
  return data;
}

export async function createProject(data: { name: string; color: string; description?: string }): Promise<Project> {
  const { data: created } = await api.post<Project>("/projects/", data);
  return created;
}

export async function updateProject(id: string, data: { name?: string; color?: string; description?: string }): Promise<Project> {
  const { data: updated } = await api.put<Project>(`/projects/${id}`, data);
  return updated;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}
