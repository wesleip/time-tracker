import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as sectionsService from "../services/sections";
import type { Section } from "../types";

export function useSections() {
  return useQuery<Section[]>({
    queryKey: ["sections"],
    queryFn: sectionsService.fetchSections,
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sectionsService.createSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Parameters<typeof sectionsService.updateSection>[1]) =>
      sectionsService.updateSection(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sectionsService.deleteSection,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
  });
}
