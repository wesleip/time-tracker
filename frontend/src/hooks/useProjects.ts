import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectsService from "../services/projects";
import type { Project } from "../types";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: projectsService.fetchProjects,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof projectsService.updateProject>[1]) =>
      projectsService.updateProject(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: projectsService.deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
