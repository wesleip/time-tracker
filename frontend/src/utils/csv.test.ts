import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("usa ; como separador e vírgula decimal", () => {
    expect(toCsv([["Data", "Horas"], ["2026-01-05", 1.5]])).toBe("Data;Horas\r\n2026-01-05;1,5");
  });

  it("escapa campos com separador, aspas e quebra de linha", () => {
    expect(toCsv([["a;b", 'diz "oi"', "linha\nnova"]])).toBe('"a;b";"diz ""oi""";"linha\nnova"');
  });

  it("mantém texto comum sem aspas", () => {
    expect(toCsv([["Projeto A", "2026-01-05"]])).toBe("Projeto A;2026-01-05");
  });
});
