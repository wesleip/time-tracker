import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "../hooks/useProjects";
import type { Project } from "../types";

const projectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  color: z.string().min(1),
  description: z.string().max(500).optional(),
});

type ProjectForm = z.infer<typeof projectSchema>;

const colorOptions = [
  { value: "#22c55e", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#f97316", label: "Laranja" },
  { value: "#a855f7", label: "Roxo" },
  { value: "#84cc16", label: "Limão" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#6366f1", label: "Índigo" },
];

export function Projects() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", color: "#6366f1", description: "" },
  });

  function handleNew() {
    setEditingProject(null);
    reset({ name: "", color: "#6366f1", description: "" });
    setModalOpen(true);
  }

  function handleEdit(p: Project) {
    setEditingProject(p);
    reset({ name: p.name, color: p.color, description: p.description ?? "" });
    setModalOpen(true);
  }

  async function onSubmit(data: ProjectForm) {
    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, ...data });
    } else {
      await createProject.mutateAsync(data);
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    await deleteProject.mutateAsync(id);
  }

  return (
    <Layout title="Projetos">
      <div className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleNew}>+ Novo Projeto</Button>
        </div>

        {isLoading && <p className="text-text-muted text-sm">Carregando...</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((project) => (
            <Card key={project.id} hover className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge color={project.color}>{project.name}</Badge>
              </div>
              {project.description && (
                <p className="text-xs text-text-secondary">{project.description}</p>
              )}
              <p className="text-xs text-text-muted">
                Criado em {new Date(project.createdAt).toLocaleDateString("pt-BR")}
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => handleEdit(project)}>
                  Editar
                </Button>
                <Button variant="danger" className="!px-3 !py-1 text-xs" onClick={() => handleDelete(project.id)}>
                  Excluir
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Modal open={modalOpen} title={editingProject ? "Editar Projeto" : "Novo Projeto"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Nome"
                placeholder="Nome do projeto"
                {...register("name")}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Cor</label>
              <select
                className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
                {...register("color")}
              >
                {colorOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Input
                label="Descrição"
                placeholder="Descrição opcional"
                {...register("description")}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
}
