import api from "./client";
import type { TimeEntryWithProject, DailyReport, WeeklyReport, MonthlyReport } from "../types";

export async function fetchEntries(date?: string, projectId?: string): Promise<TimeEntryWithProject[]> {
  const params: Record<string, string> = {};
  if (date) params.date = date;
  if (projectId) params.project_id = projectId;
  const { data } = await api.get<TimeEntryWithProject[]>("/entries/", { params });
  return data;
}

export async function createEntry(data: {
  projectId: string;
  date: string;
  hours: number;
  description?: string;
}): Promise<TimeEntryWithProject> {
  const { data: created } = await api.post<TimeEntryWithProject>("/entries/", data);
  return created;
}

export async function updateEntry(
  id: string,
  data: { projectId?: string; date?: string; hours?: number; description?: string }
): Promise<TimeEntryWithProject> {
  const { data: updated } = await api.put<TimeEntryWithProject>(`/entries/${id}`, data);
  return updated;
}

export async function deleteEntry(id: string): Promise<void> {
  await api.delete(`/entries/${id}`);
}

export async function fetchDailyReport(date: string): Promise<DailyReport> {
  const { data } = await api.get<DailyReport>("/reports/daily", { params: { report_date: date } });
  return data;
}

export async function fetchWeeklyReport(date: string): Promise<WeeklyReport> {
  const { data } = await api.get<WeeklyReport>("/reports/weekly", { params: { report_date: date } });
  return data;
}

export async function fetchMonthlyReport(month: string): Promise<MonthlyReport> {
  const { data } = await api.get<MonthlyReport>("/reports/monthly", { params: { month } });
  return data;
}
