import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
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
  const { data: projects, isLoading, isError } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", color: "#6366f1", description: "" },
  });

  const filteredProjects = useMemo(() => {
    const list = projects ?? [];
    if (!search.trim()) return list;
    return list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [projects, search]);

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

  async function handleConfirmDelete(id: string) {
    await deleteProject.mutateAsync(id);
    setConfirmDeleteId(null);
  }

  return (
    <Layout title="Projetos">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="max-w-xs flex-1">
            <Input
              label=""
              placeholder="Buscar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!py-1.5"
            />
          </div>
          <Button onClick={handleNew}>+ Novo Projeto</Button>
        </div>

        {isError && (
          <p className="text-sm text-error">Erro ao carregar projetos. Tente novamente.</p>
        )}

        {isLoading && !isError && (
          <p className="text-text-muted text-sm">Carregando...</p>
        )}

        {!isLoading && !isError && filteredProjects.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-text-muted text-sm">
              {search ? "Nenhum projeto encontrado." : "Nenhum projeto cadastrado."}
            </p>
          </Card>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
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
                {confirmDeleteId === project.id ? (
                  <>
                    <Button variant="danger" className="!px-3 !py-1 text-xs" onClick={() => handleConfirmDelete(project.id)}>
                      Confirmar
                    </Button>
                    <Button variant="secondary" className="!px-3 !py-1 text-xs" onClick={() => setConfirmDeleteId(null)}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button variant="danger" className="!px-3 !py-1 text-xs" onClick={() => setConfirmDeleteId(project.id)}>
                    Excluir
                  </Button>
                )}
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
            <Select
              label="Cor"
              options={colorOptions}
              {...register("color")}
            />
            <Input
              label="Descrição"
              placeholder="Descrição opcional"
              {...register("description")}
            />
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
