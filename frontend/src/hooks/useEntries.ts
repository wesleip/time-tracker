import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as entriesService from "../services/timeEntries";
import type { DailyReport, MonthlyReport, TimeEntryWithProject, WeeklyReport } from "../types";

export function useEntries(date?: string) {
  return useQuery<TimeEntryWithProject[]>({
    queryKey: ["entries", date],
    queryFn: () => entriesService.fetchEntries(date),
    enabled: !!date,
  });
}

export function useDailyReport(date: string) {
  return useQuery<DailyReport>({
    queryKey: ["dailyReport", date],
    queryFn: () => entriesService.fetchDailyReport(date),
    enabled: !!date,
  });
}

export function useWeeklyReport(date: string) {
  return useQuery<WeeklyReport>({
    queryKey: ["weeklyReport", date],
    queryFn: () => entriesService.fetchWeeklyReport(date),
    enabled: !!date,
  });
}

export function useMonthlyReport(month: string) {
  return useQuery<MonthlyReport>({
    queryKey: ["monthlyReport", month],
    queryFn: () => entriesService.fetchMonthlyReport(month),
    enabled: !!month,
  });
}

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ["entries"] });
  qc.invalidateQueries({ queryKey: ["dailyReport"] });
  qc.invalidateQueries({ queryKey: ["weeklyReport"] });
  qc.invalidateQueries({ queryKey: ["monthlyReport"] });
};

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: entriesService.createEntry,
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof entriesService.updateEntry>[1]) =>
      entriesService.updateEntry(id, data),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: entriesService.deleteEntry,
    onSuccess: () => invalidateAll(qc),
  });
}
