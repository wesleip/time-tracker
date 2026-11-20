import { describe, expect, it } from "vitest";
import { buildTimesheet } from "./timesheet";
import type { MonthlyReportDay } from "../types";

const days: MonthlyReportDay[] = [
  {
    date: "2026-02-02",
    totalHours: 5,
    projects: [
      { projectId: "a", projectName: "Beta", projectColor: "#111111", totalHours: 3, entriesCount: 1 },
      { projectId: "b", projectName: "Alfa", projectColor: "#222222", totalHours: 2, entriesCount: 1 },
    ],
  },
  {
    date: "2026-02-03",
    totalHours: 4,
    projects: [
      { projectId: "a", projectName: "Beta", projectColor: "#111111", totalHours: 4, entriesCount: 1 },
    ],
  },
];

describe("buildTimesheet", () => {
  it("usa os projetos como colunas ordenadas por nome", () => {
    expect(buildTimesheet(days).projects.map((p) => p.name)).toEqual(["Alfa", "Beta"]);
  });

  it("posiciona as horas na coluna do projeto e soma por dia", () => {
    const sheet = buildTimesheet(days);

    expect(sheet.rows).toEqual([
      { date: "2026-02-02", cells: [2, 3], total: 5 },
      { date: "2026-02-03", cells: [0, 4], total: 4 },
    ]);
  });

  it("soma as colunas e o total do mês", () => {
    const sheet = buildTimesheet(days);

    expect(sheet.totals).toEqual([2, 7]);
    expect(sheet.total).toBe(9);
  });

  it("remove sobras de ponto flutuante", () => {
    const sheet = buildTimesheet([
      {
        date: "2026-02-02",
        totalHours: 0.3,
        projects: [
          { projectId: "a", projectName: "A", projectColor: "#000", totalHours: 0.1, entriesCount: 1 },
          { projectId: "a", projectName: "A", projectColor: "#000", totalHours: 0.2, entriesCount: 1 },
        ],
      },
    ]);

    expect(sheet.rows[0].cells).toEqual([0.3]);
  });

  it("devolve grade vazia sem registros", () => {
    expect(buildTimesheet([])).toEqual({ projects: [], rows: [], totals: [], total: 0 });
  });
});
