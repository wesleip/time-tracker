export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  userId: string;
  name: string;
  color: string;
  order: number;
  createdAt: string;
}

export type TaskStatus = "pending" | "completed";

export type Recurrence = "daily" | "weekly" | "monthly" | null;

export interface Task {
  id: string;
  userId: string;
  sectionId: string | null;
  projectId: string | null;
  parentId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  dueDate: string | null;
  recurrence: Recurrence;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  description: string | null;
  hours: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntryWithProject extends TimeEntry {
  projectName: string;
  projectColor: string;
}

export interface DailySummaryItem {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalHours: number;
  entriesCount: number;
}

export interface DailyReport {
  date: string;
  totalHours: number;
  projects: DailySummaryItem[];
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  totalHours: number;
  days: WeeklyReportDay[];
}

export interface WeeklyReportDay {
  date: string;
  totalHours: number;
  projects: DailySummaryItem[];
}

export interface MonthlyReportDay {
  date: string;
  totalHours: number;
  projects: DailySummaryItem[];
}

export interface MonthlyReport {
  month: string;
  totalHours: number;
  days: MonthlyReportDay[];
}
