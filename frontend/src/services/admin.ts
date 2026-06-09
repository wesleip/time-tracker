import api from "./client";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface AdminProject {
  id: string;
  name: string;
  description: string | null;
  color: string;
  ownerId: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: string;
}

export interface AdminTimeLog {
  id: string;
  hours: number;
  date: string;
  description: string | null;
  projectId: string;
  projectName: string;
  ownerId: string | null;
  ownerName: string | null;
}

export interface AdminOverview {
  totalUsers: number;
  totalProjects: number;
  totalEntries: number;
  totalHours: number;
}

export async function getOverview(): Promise<AdminOverview> {
  const { data } = await api.get("/admin/overview");
  return data;
}

export async function getUsers(): Promise<AdminUser[]> {
  const { data } = await api.get("/admin/users");
  return data;
}

export async function toggleAdmin(userId: string): Promise<AdminUser> {
  const { data } = await api.patch(`/admin/users/${userId}/toggle-admin`);
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/admin/users/${userId}`);
}

export async function getProjects(): Promise<AdminProject[]> {
  const { data } = await api.get("/admin/projects");
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/admin/projects/${projectId}`);
}

export async function getTimeLogs(userId?: string): Promise<AdminTimeLog[]> {
  const { data } = await api.get("/admin/timelogs", {
    params: userId ? { user_id: userId } : undefined,
  });
  return data;
}
