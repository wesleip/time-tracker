import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tasksService from "../services/tasks";
import type { TaskStatus } from "../types";

interface TaskFilters {
  status?: TaskStatus;
  sectionId?: string;
  dueDate?: string;
  search?: string;
  projectId?: string;
}

export function useTasks(filters?: TaskFilters, pagination?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["tasks", filters, pagination],
    queryFn: () => tasksService.fetchTasks(filters, pagination),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksService.createTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof tasksService.updateTask>[1]) =>
      tasksService.updateTask(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksService.deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useToggleTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksService.toggleTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tasksService.completeTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
