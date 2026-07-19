import api from "./client";
import type { Section } from "../types";

export async function fetchSections(): Promise<Section[]> {
  const { data } = await api.get<Section[]>("/sections/");
  return data;
}

export async function createSection(data: { name: string; color?: string }): Promise<Section> {
  const { data: created } = await api.post<Section>("/sections/", data);
  return created;
}

export async function updateSection(id: string, data: { name?: string; color?: string; order?: number }): Promise<Section> {
  const { data: updated } = await api.put<Section>(`/sections/${id}`, data);
  return updated;
}

export async function deleteSection(id: string): Promise<void> {
  await api.delete(`/sections/${id}`);
}
