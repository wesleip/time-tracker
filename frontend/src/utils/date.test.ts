import { describe, expect, it } from "vitest";
import { addDays, formatDateOnly, formatDayOfWeek, formatMonthYear, toISODate, todayISO } from "./date";

describe("toISODate", () => {
  it("formata a data local em YYYY-MM-DD", () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("preenche mês e dia com zero à esquerda", () => {
    expect(toISODate(new Date(2026, 8, 9))).toBe("2026-09-09");
  });

  it("não usa UTC (data local perto da meia-noite)", () => {
    // 23:30 local de 2026-01-05 ainda é 2026-01-05 local, mesmo em UTC-3.
    const date = new Date(2026, 0, 5, 23, 30);
    expect(toISODate(date)).not.toBe(date.toISOString().split("T")[0]);
  });
});

describe("todayISO", () => {
  it("retorna a data de hoje no formato local", () => {
    expect(todayISO()).toBe(toISODate(new Date()));
  });
});

describe("addDays", () => {
  it("soma dias preservando o mês", () => {
    expect(toISODate(addDays(new Date(2026, 0, 30), 3))).toBe("2026-02-02");
  });

  it("volta no tempo", () => {
    expect(toISODate(addDays(new Date(2026, 0, 3), -3))).toBe("2025-12-31");
  });

  it("não altera a data original", () => {
    const original = new Date(2026, 0, 10);
    addDays(original, 5);
    expect(toISODate(original)).toBe("2026-01-10");
  });
});

describe("formatadores", () => {
  it("formata mês e ano a partir de YYYY-MM", () => {
    expect(formatMonthYear("2026-06")).toBe("Junho 2026");
  });

  it("formata dia da semana a partir de YYYY-MM-DD", () => {
    expect(formatDayOfWeek("2026-06-05")).toBe("sexta");
  });

  it("formata data sem deslocar de dia", () => {
    expect(formatDateOnly("2026-06-05")).toContain("junho");
  });
});
