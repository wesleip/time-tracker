import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tasksService from "../services/tasks";
import type { Task, TaskStatus } from "../types";

interface TaskFilters {
  status?: TaskStatus;
  sectionId?: string;
  dueDate?: string;
  search?: string;
  projectId?: string;
}

export function useTasks(filters?: TaskFilters) {
  return useQuery<Task[]>({
    queryKey: ["tasks", filters],
    queryFn: () => tasksService.fetchTasks(filters),
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
