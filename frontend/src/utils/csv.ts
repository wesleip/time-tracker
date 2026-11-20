// CSV pensado para planilhas em pt-BR: separador ";" e vírgula decimal.
export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(cell).join(";")).join("\r\n");
}

function cell(value: string | number): string {
  const text = typeof value === "number" ? String(value).replace(".", ",") : value;
  return /[";\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function downloadCsv(filename: string, csv: string) {
  // BOM: sem ele o Excel abre os acentos errados.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
