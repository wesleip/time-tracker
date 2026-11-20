import type { MonthlyReportDay } from "../types";

export interface TimesheetProject {
  id: string;
  name: string;
  color: string;
}

export interface TimesheetRow {
  date: string;
  cells: number[];
  total: number;
}

export interface Timesheet {
  projects: TimesheetProject[];
  rows: TimesheetRow[];
  totals: number[];
  total: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

// Grade dias x projetos do relatório mensal: os projetos viram colunas e cada dia uma linha.
export function buildTimesheet(days: MonthlyReportDay[]): Timesheet {
  const byId = new Map<string, TimesheetProject>();
  for (const day of days) {
    for (const project of day.projects) {
      if (!byId.has(project.projectId)) {
        byId.set(project.projectId, {
          id: project.projectId,
          name: project.projectName,
          color: project.projectColor,
        });
      }
    }
  }

  const projects = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const columnOf = new Map(projects.map((project, index) => [project.id, index]));
  const totals = projects.map(() => 0);

  const rows = days.map((day) => {
    const cells = projects.map(() => 0);
    for (const project of day.projects) {
      const column = columnOf.get(project.projectId)!;
      cells[column] = round(cells[column] + project.totalHours);
      totals[column] = round(totals[column] + project.totalHours);
    }
    return { date: day.date, cells, total: round(day.totalHours) };
  });

  return {
    projects,
    rows,
    totals,
    total: round(rows.reduce((sum, row) => sum + row.total, 0)),
  };
}
