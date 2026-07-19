import api from "./client";
import type { Task, TaskStatus } from "../types";

interface TaskFilters {
  status?: TaskStatus;
  sectionId?: string;
  dueDate?: string;
  search?: string;
  projectId?: string;
}

export async function fetchTasks(filters?: TaskFilters): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.sectionId) params.append("section_id", filters.sectionId);
  if (filters?.dueDate) params.append("due_date", filters.dueDate);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.projectId) params.append("project_id", filters.projectId);

  const { data } = await api.get<Task[]>(`/tasks/?${params.toString()}`);
  return data;
}

export async function createTask(data: {
  title: string;
  description?: string;
  sectionId?: string;
  projectId?: string;
  priority?: number;
  dueDate?: string;
  recurrence?: string;
}): Promise<Task> {
  const { data: created } = await api.post<Task>("/tasks/", data);
  return created;
}

export async function updateTask(id: string, data: {
  title?: string;
  description?: string;
  sectionId?: string;
  projectId?: string;
  priority?: number;
  dueDate?: string;
  recurrence?: string;
}): Promise<Task> {
  const { data: updated } = await api.put<Task>(`/tasks/${id}`, data);
  return updated;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

export async function toggleTask(id: string): Promise<{ id: string; status: TaskStatus; completedAt: string | null }> {
  const { data } = await api.patch<{ id: string; status: TaskStatus; completedAt: string | null }>(`/tasks/${id}/toggle`);
  return data;
}

export async function completeTask(id: string): Promise<Task> {
  const { data } = await api.patch<Task>(`/tasks/${id}/complete`);
  return data;
}
