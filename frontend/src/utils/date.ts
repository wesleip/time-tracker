const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const DAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateOnly(dateStr: string): string {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatDayOfWeek(dateStr: string): string {
  return DAYS[new Date(dateStr + "T12:00:00").getDay()];
}

export function formatMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split("-");
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
}

// Datas locais em "YYYY-MM-DD". new Date().toISOString() usaria UTC e deslocaria
// o dia em fusos negativos (UTC-3) à noite.
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
