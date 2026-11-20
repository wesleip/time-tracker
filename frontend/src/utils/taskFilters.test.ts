import { describe, expect, it } from "vitest";
import { matchesWhenFilter } from "./taskFilters";

// Sexta-feira, 2026-11-20
const NOW = new Date(2026, 10, 20, 12, 0);

describe("matchesWhenFilter", () => {
  it("sem filtro, aceita qualquer tarefa", () => {
    expect(matchesWhenFilter(null, "", NOW)).toBe(true);
    expect(matchesWhenFilter("2026-01-01", "", NOW)).toBe(true);
  });

  it("hoje", () => {
    expect(matchesWhenFilter("2026-11-20", "today", NOW)).toBe(true);
    expect(matchesWhenFilter("2026-11-21", "today", NOW)).toBe(false);
  });

  it("amanhã", () => {
    expect(matchesWhenFilter("2026-11-21", "tomorrow", NOW)).toBe(true);
    expect(matchesWhenFilter("2026-11-20", "tomorrow", NOW)).toBe(false);
  });

  it("esta semana: segunda a domingo", () => {
    expect(matchesWhenFilter("2026-11-16", "week", NOW)).toBe(true); // segunda
    expect(matchesWhenFilter("2026-11-22", "week", NOW)).toBe(true); // domingo
    expect(matchesWhenFilter("2026-11-15", "week", NOW)).toBe(false); // domingo anterior
    expect(matchesWhenFilter("2026-11-23", "week", NOW)).toBe(false); // segunda seguinte
  });

  it("próxima semana: a semana seguinte, inteira", () => {
    expect(matchesWhenFilter("2026-11-23", "nextWeek", NOW)).toBe(true);
    expect(matchesWhenFilter("2026-11-29", "nextWeek", NOW)).toBe(true);
    expect(matchesWhenFilter("2026-11-22", "nextWeek", NOW)).toBe(false);
    expect(matchesWhenFilter("2026-11-30", "nextWeek", NOW)).toBe(false);
  });

  it("tarefa sem vencimento fica de fora quando há filtro de prazo", () => {
    expect(matchesWhenFilter(null, "today", NOW)).toBe(false);
    expect(matchesWhenFilter(null, "week", NOW)).toBe(false);
  });

  it("semana que começa no domingo", () => {
    const sunday = new Date(2026, 10, 22, 12, 0);
    expect(matchesWhenFilter("2026-11-16", "week", sunday)).toBe(true);
    expect(matchesWhenFilter("2026-11-23", "week", sunday)).toBe(false);
    expect(matchesWhenFilter("2026-11-23", "nextWeek", sunday)).toBe(true);
  });

  it("semana que começa na segunda", () => {
    const monday = new Date(2026, 10, 23, 12, 0);
    expect(matchesWhenFilter("2026-11-23", "week", monday)).toBe(true);
    expect(matchesWhenFilter("2026-11-29", "week", monday)).toBe(true);
    expect(matchesWhenFilter("2026-11-22", "week", monday)).toBe(false);
    expect(matchesWhenFilter("2026-11-30", "nextWeek", monday)).toBe(true);
  });

  it("vira o mês e o ano corretamente", () => {
    const december = new Date(2026, 11, 31, 12, 0);
    expect(matchesWhenFilter("2026-12-28", "week", december)).toBe(true);
    expect(matchesWhenFilter("2027-01-03", "week", december)).toBe(true);
    expect(matchesWhenFilter("2027-01-04", "nextWeek", december)).toBe(true);
  });
});
