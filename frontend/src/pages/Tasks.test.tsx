import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tasks } from "./Tasks";
import * as tasksService from "../services/tasks";
import * as sectionsService from "../services/sections";
import * as projectsService from "../services/projects";
import * as notificationsService from "../services/notifications";
import type { Section, Task } from "../types";

vi.mock("../services/tasks");
vi.mock("../services/sections");
vi.mock("../services/projects");
vi.mock("../services/notifications");

const section = (over: Partial<Section> = {}): Section => ({
  id: "s1",
  userId: "u1",
  name: "Geral",
  color: "#6366f1",
  order: 0,
  createdAt: "2026-01-01T00:00:00",
  ...over,
});

const task = (over: Partial<Task> = {}): Task => ({
  id: "t1",
  userId: "u1",
  sectionId: "s1",
  projectId: null,
  parentId: null,
  title: "Tarefa A",
  description: null,
  status: "pending",
  priority: 3,
  dueDate: null,
  recurrence: null,
  completedAt: null,
  createdAt: "2026-01-01T00:00:00",
  updatedAt: "2026-01-01T00:00:00",
  ...over,
});

function renderTasks() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <Tasks />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(tasksService.fetchTasks).mockResolvedValue({ items: [task()], total: 1 });
  vi.mocked(sectionsService.fetchSections).mockResolvedValue([section()]);
  vi.mocked(projectsService.fetchProjects).mockResolvedValue([]);
  vi.mocked(notificationsService.getUnreadCount).mockResolvedValue(0);
  vi.clearAllMocks();
});

describe("Tarefas", () => {
  it("mostra as tarefas devolvidas pela API", async () => {
    renderTasks();

    expect(await screen.findByText("Tarefa A")).toBeInTheDocument();
    expect(tasksService.fetchTasks).toHaveBeenCalled();
  });

  it("agrupa as tarefas pela seção configurada", async () => {
    vi.mocked(tasksService.fetchTasks).mockResolvedValue({
      items: [task({ id: "t1", title: "Tarefa A", sectionId: "s1" })],
      total: 1,
    });
    vi.mocked(sectionsService.fetchSections).mockResolvedValue([section({ id: "s1", name: "Trabalho" })]);

    renderTasks();

    expect(await screen.findByRole("heading", { name: /Trabalho/ })).toBeInTheDocument();
  });

  it("mostra seções vazias quando não há filtro ativo", async () => {
    vi.mocked(tasksService.fetchTasks).mockResolvedValue({ items: [], total: 0 });
    vi.mocked(sectionsService.fetchSections).mockResolvedValue([section({ id: "s2", name: "Vazia" })]);

    renderTasks();

    expect(await screen.findByRole("heading", { name: /Vazia/ })).toBeInTheDocument();
  });

  it("carrega mais tarefas quando o total é maior que a página", async () => {
    vi.mocked(tasksService.fetchTasks).mockResolvedValue({ items: [task()], total: 120 });

    renderTasks();

    expect(await screen.findByText("Mostrando 1 de 120")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    await waitFor(() =>
      expect(tasksService.fetchTasks).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ limit: 100 })
      )
    );
  });

  it("não mostra o botão de carregar mais quando tudo já está na página", async () => {
    vi.mocked(tasksService.fetchTasks).mockResolvedValue({ items: [task()], total: 1 });

    renderTasks();

    expect(await screen.findByText("Tarefa A")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Carregar mais" })).not.toBeInTheDocument();
  });

  it("manda o filtro de status para a API", async () => {
    renderTasks();
    await screen.findByText("Tarefa A");

    fireEvent.change(screen.getByLabelText("Filtrar por status"), { target: { value: "pending" } });

    await waitFor(() =>
      expect(tasksService.fetchTasks).toHaveBeenCalledWith(
        expect.objectContaining({ status: "pending" }),
        expect.objectContaining({ limit: 50 })
      )
    );
  });

  it("manda o termo de busca para a API", async () => {
    renderTasks();
    await screen.findByText("Tarefa A");

    fireEvent.change(screen.getByLabelText("Buscar tarefas"), {
      target: { value: "relatório" },
    });

    await waitFor(() =>
      expect(tasksService.fetchTasks).toHaveBeenCalledWith(
        expect.objectContaining({ search: "relatório" }),
        expect.objectContaining({ limit: 50 })
      )
    );
  });
});
