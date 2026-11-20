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
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTask, useCompleteTask } from "../hooks/useTasks";
import { useSections, useCreateSection, useUpdateSection, useDeleteSection } from "../hooks/useSections";
import { useProjects } from "../hooks/useProjects";
import { TimeSuggestionModal } from "../components/tasks/TimeSuggestionModal";
import { toISODate } from "../utils/date";
import { matchesWhenFilter, type WhenFilter } from "../utils/taskFilters";
import type { Task, Section, TaskStatus } from "../types";

const taskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(255),
  description: z.string().max(1000).optional(),
  priority: z.number().min(1).max(4),
  dueDate: z.string().optional(),
  recurrence: z.string().optional(),
  sectionId: z.string().optional(),
  projectId: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

const priorityOptions = [
  { value: "1", label: "1 - Urgente" },
  { value: "2", label: "2 - Alta" },
  { value: "3", label: "3 - Média" },
  { value: "4", label: "4 - Baixa" },
];

const recurrenceOptions = [
  { value: "", label: "Sem recorrência" },
  { value: "daily", label: "Diária" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

const statusFilters = [
  { value: "", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "completed", label: "Concluídas" },
];

// Datas chegam como "YYYY-MM-DD". new Date("2026-11-19") é interpretado como UTC
// e vira o dia anterior em fusos negativos (UTC-3) — por isso o parse local explícito.
function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return parseLocalDate(dateStr).toLocaleDateString("pt-BR");
}

function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr < toISODate(new Date());
}

function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return dateStr === toISODate(new Date());
}
const PAGE_SIZE = 50;

const priorityColors: Record<number, string> = {
  1: "bg-red-100 text-red-700 border-red-200",
  2: "bg-orange-100 text-orange-700 border-orange-200",
  3: "bg-blue-100 text-blue-700 border-blue-200",
  4: "bg-gray-100 text-gray-600 border-gray-200",
};

const whenFilters = [
  { value: "", label: "Qualquer prazo" },
  { value: "today", label: "Hoje" },
  { value: "tomorrow", label: "Amanhã" },
  { value: "week", label: "Esta semana" },
  { value: "nextWeek", label: "Próxima semana" },
];

export function Tasks() {
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "">("");
  const [filterSection, setFilterSection] = useState<string>("");
  const [filterProject, setFilterProject] = useState<string>("");
  const [filterWhen, setFilterWhen] = useState<WhenFilter>("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [suggestedTask, setSuggestedTask] = useState<Task | null>(null);
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Trocar de filtro volta para a primeira página (ajuste de estado durante o render).
  const filterKey = `${filterStatus}|${filterSection}|${filterProject}|${filterWhen}|${search}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setLimit(PAGE_SIZE);
  }

  const { data: taskPage, isLoading, isFetching } = useTasks(
    {
      status: filterStatus || undefined,
      sectionId: filterSection || undefined,
      projectId: filterProject || undefined,
      search: search || undefined,
    },
    { limit }
  );
  const tasks = useMemo(() => taskPage?.items ?? [], [taskPage]);
  const totalTasks = taskPage?.total ?? 0;
  const { data: sections } = useSections();
  const { data: projects } = useProjects();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleTask = useToggleTask();
  const completeTask = useCompleteTask();

  const createSection = useCreateSection();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", priority: 3, dueDate: "", recurrence: "", sectionId: "", projectId: "" },
  });

  const { register: registerSection, handleSubmit: handleSubmitSection, reset: resetSection, formState: { errors: sectionErrors, isSubmitting: isSubmittingSection } } = useForm({
    defaultValues: { name: "", color: "#6366f1" },
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    const sorted = [...tasks].sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (a.status !== "completed" && b.status === "completed") return -1;
      return a.priority - b.priority;
    });
    if (!filterWhen) return sorted;

    const now = new Date();
    return sorted.filter((task) => matchesWhenFilter(task.dueDate, filterWhen, now));
  }, [tasks, filterWhen]);

  const hasActiveFilter = !!(search || filterStatus || filterSection || filterProject || filterWhen);

  const tasksBySection = useMemo(() => {
    const map = new Map<string | null, Task[]>();
    filteredTasks.forEach((task) => {
      const sectionId = task.sectionId;
      if (!map.has(sectionId)) map.set(sectionId, []);
      map.get(sectionId)!.push(task);
    });
    // Seções sem tarefas aparecem na lista quando não há filtro ativo, para
    // poderem ser reordenadas, editadas ou excluídas.
    if (!hasActiveFilter && sections) {
      for (const section of sections) {
        if (!map.has(section.id)) map.set(section.id, []);
      }
    }
    // Grupos na ordem configurada das seções ("Sem seção" por último).
    const orderOf = (sectionId: string | null) =>
      sectionId ? sections?.find((s) => s.id === sectionId)?.order ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    return new Map(
      [...map.entries()].sort(([a], [b]) => orderOf(a) - orderOf(b))
    );
  }, [filteredTasks, sections, hasActiveFilter]);

  function getSectionName(sectionId: string | null): string {
    if (!sectionId) return "Sem seção";
    return sections?.find((s) => s.id === sectionId)?.name ?? "Seção";
  }

  function projectById(projectId: string) {
    return projects?.find((p) => p.id === projectId);
  }

  function handleNew() {
    setEditingTask(null);
    reset({ title: "", description: "", priority: 3, dueDate: "", recurrence: "", sectionId: "", projectId: "" });
    setModalOpen(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: task.dueDate ?? "",
      recurrence: task.recurrence ?? "",
      sectionId: task.sectionId ?? "",
      projectId: task.projectId ?? "",
    });
    setModalOpen(true);
  }

  async function onSubmit(data: TaskForm) {
    const payload = {
      title: data.title,
      description: data.description || undefined,
      priority: data.priority,
      dueDate: data.dueDate || undefined,
      recurrence: data.recurrence || undefined,
      sectionId: data.sectionId || undefined,
      projectId: data.projectId || undefined,
    };

    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    setModalOpen(false);
  }

  async function handleToggle(task: Task) {
    if (task.status === "completed") {
      // Reabrir: o endpoint de conclusão não volta a tarefa para pendente.
      await toggleTask.mutateAsync(task.id);
      return;
    }
    // Concluir via /complete para processar a recorrência (cria a próxima ocorrência).
    await completeTask.mutateAsync(task.id);
    if (task.projectId) {
      setSuggestedTask(task);
    }
  }

  async function handleConfirmDelete(id: string) {
    await deleteTask.mutateAsync(id);
    setConfirmDeleteId(null);
  }

  function handleNewSection() {
    setEditingSection(null);
    resetSection({ name: "", color: "#6366f1" });
    setSectionModalOpen(true);
  }

  function handleEditSection(section: Section) {
    setEditingSection(section);
    resetSection({ name: section.name, color: section.color });
    setSectionModalOpen(true);
  }

  async function onSubmitSection(data: { name: string; color: string }) {
    if (editingSection) {
      await updateSection.mutateAsync({ id: editingSection.id, ...data });
    } else {
      await createSection.mutateAsync(data);
    }
    setSectionModalOpen(false);
  }

  async function handleDeleteSection(id: string) {
    await deleteSection.mutateAsync(id);
    if (filterSection === id) setFilterSection("");
  }

  async function handleMoveSection(sectionId: string, direction: "up" | "down") {
    if (!sections) return;
    const ordered = [...sections];
    const index = ordered.findIndex((s) => s.id === sectionId);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= ordered.length) return;

    const [moved] = ordered.splice(index, 1);
    ordered.splice(target, 0, moved);

    // Renumera sequencialmente para não depender de trocas de valores iguais.
    for (const [position, section] of ordered.entries()) {
      if (section.order !== position) {
        await updateSection.mutateAsync({ id: section.id, order: position });
      }
    }
  }

  return (
    <Layout title="Tarefas">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              label=""
              aria-label="Buscar tarefas"
              placeholder="Buscar tarefas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="!py-1.5"
            />
          </div>
          <Select
            label=""
            aria-label="Filtrar por status"
            options={statusFilters}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | "")}
            className="!py-1.5 min-w-[140px]"
          />
          <Select
            label=""
            aria-label="Filtrar por seção"
            options={[
              { value: "", label: "Todas seções" },
              ...(sections?.map((s) => ({ value: s.id, label: s.name })) ?? []),
            ]}
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="!py-1.5 min-w-[140px]"
          />
          <Select
            label=""
            aria-label="Filtrar por projeto"
            options={[
              { value: "", label: "Todos os projetos" },
              ...(projects?.map((p) => ({ value: p.id, label: p.name })) ?? []),
            ]}
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="!py-1.5 min-w-[140px]"
          />
          <Select
            label=""
            aria-label="Filtrar por prazo"
            options={whenFilters}
            value={filterWhen}
            onChange={(e) => setFilterWhen(e.target.value as WhenFilter)}
            className="!py-1.5 min-w-[140px]"
          />
          <Button onClick={handleNew}>+ Nova Tarefa</Button>
          <Button variant="secondary" onClick={handleNewSection}>+ Seção</Button>
        </div>

        {isLoading && <p className="text-text-muted text-sm">Carregando...</p>}

        {!isLoading && filteredTasks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-text-muted text-sm">
              {search || filterStatus || filterSection || filterProject || filterWhen
                ? "Nenhuma tarefa encontrada."
                : "Nenhuma tarefa cadastrada."}
            </p>
          </Card>
        )}

        <div className="space-y-6">
          {Array.from(tasksBySection.entries()).map(([sectionId, sectionTasks]) => (
            <div key={sectionId ?? "no-section"}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-text-primary flex items-center gap-2">
                  {sectionId && sections?.find((s) => s.id === sectionId) && (
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sections.find((s) => s.id === sectionId)?.color }}
                    />
                  )}
                  {getSectionName(sectionId)}
                  <span className="text-xs text-text-muted">({sectionTasks.length})</span>
                </h3>
                {sectionId && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveSection(sectionId, "up")}
                      aria-label={`Mover seção ${getSectionName(sectionId)} para cima`}
                      title="Mover para cima"
                      className="text-xs text-text-muted hover:text-primary-600 p-1"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveSection(sectionId, "down")}
                      aria-label={`Mover seção ${getSectionName(sectionId)} para baixo`}
                      title="Mover para baixo"
                      className="text-xs text-text-muted hover:text-primary-600 p-1"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        const section = sections?.find((s) => s.id === sectionId);
                        if (section) handleEditSection(section);
                      }}
                      className="text-xs text-text-muted hover:text-primary-600 p-1"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSection(sectionId)}
                      className="text-xs text-text-muted hover:text-red-600 p-1"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {sectionTasks.map((task) => (
                  <Card key={task.id} className={`p-4 ${task.status === "completed" ? "opacity-60" : ""}`}>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggle(task)}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          task.status === "completed"
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-primary-500"
                        }`}
                      >
                        {task.status === "completed" && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-medium ${task.status === "completed" ? "line-through text-text-muted" : "text-text-primary"}`}>
                            {task.title}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                            {task.priority === 1 ? "Urgente" : task.priority === 2 ? "Alta" : task.priority === 3 ? "Média" : "Baixa"}
                          </span>
                          {task.recurrence && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700 border border-purple-200">
                              {task.recurrence === "daily" ? "Diária" : task.recurrence === "weekly" ? "Semanal" : "Mensal"}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={`text-xs px-2 py-0.5 rounded border ${
                              isOverdue(task.dueDate) && task.status !== "completed"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : isDueToday(task.dueDate)
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                              {formatDate(task.dueDate)}
                              {isOverdue(task.dueDate) && task.status !== "completed" && " (atrasada)"}
                            </span>
                          )}
                          {task.projectId && projectById(task.projectId) && (
                            <span className="text-xs px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-100 inline-flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: projectById(task.projectId)?.color }}
                              />
                              {projectById(task.projectId)?.name}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-sm text-text-secondary mt-1 truncate">{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-xs text-text-muted hover:text-primary-600 p-1"
                        >
                          Editar
                        </button>
                        {confirmDeleteId === task.id ? (
                          <>
                            <button
                              onClick={() => handleConfirmDelete(task.id)}
                              className="text-xs text-red-600 hover:text-red-700 p-1 font-medium"
                            >
                              Confirmar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs text-text-muted hover:text-text-secondary p-1"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(task.id)}
                            className="text-xs text-text-muted hover:text-red-600 p-1"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {tasks.length < totalTasks && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs text-text-muted">
              Mostrando {tasks.length} de {totalTasks}
            </p>
            <Button
              variant="secondary"
              onClick={() => setLimit((current) => current + PAGE_SIZE)}
              disabled={isFetching}
            >
              {isFetching ? "Carregando..." : "Carregar mais"}
            </Button>
          </div>
        )}

        <Modal open={modalOpen} title={editingTask ? "Editar Tarefa" : "Nova Tarefa"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                label="Título"
                placeholder="Título da tarefa"
                {...register("title")}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
              <textarea
                {...register("description")}
                placeholder="Descrição opcional"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-primary-200 bg-bg-primary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Prioridade"
                options={priorityOptions}
                {...register("priority", { valueAsNumber: true })}
              />
              <Select
                label="Recorrência"
                options={recurrenceOptions}
                {...register("recurrence")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Data de vencimento"
                type="date"
                {...register("dueDate")}
              />
              <Select
                label="Seção"
                options={[
                  { value: "", label: "Selecione..." },
                  ...(sections?.map((s) => ({ value: s.id, label: s.name })) ?? []),
                ]}
                {...register("sectionId")}
              />
            </div>
            <div>
              <Select
                label="Projeto"
                options={[
                  { value: "", label: "Sem projeto" },
                  ...(projects?.map((p) => ({ value: p.id, label: p.name })) ?? []),
                ]}
                {...register("projectId")}
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

        <Modal open={sectionModalOpen} title={editingSection ? "Editar Seção" : "Nova Seção"} onClose={() => setSectionModalOpen(false)}>
          <form onSubmit={handleSubmitSection(onSubmitSection)} className="space-y-4">
            <div>
              <Input
                label="Nome"
                placeholder="Nome da seção"
                {...registerSection("name")}
              />
              {sectionErrors.name && <p className="text-red-500 text-xs mt-1">{sectionErrors.name.message}</p>}
            </div>
            <Select
              label="Cor"
              options={[
                { value: "#22c55e", label: "Verde" },
                { value: "#3b82f6", label: "Azul" },
                { value: "#f97316", label: "Laranja" },
                { value: "#a855f7", label: "Roxo" },
                { value: "#ec4899", label: "Rosa" },
                { value: "#6366f1", label: "Índigo" },
                { value: "#e74c3c", label: "Vermelho" },
              ]}
              {...registerSection("color")}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setSectionModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmittingSection}>
                {isSubmittingSection ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Modal>

        <TimeSuggestionModal
          key={suggestedTask?.id ?? "none"}
          task={suggestedTask}
          projectName={suggestedTask?.projectId ? projectById(suggestedTask.projectId)?.name ?? "" : ""}
          onClose={() => setSuggestedTask(null)}
        />
      </div>
    </Layout>
  );
}
