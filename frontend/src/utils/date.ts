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

export function formatMonthYear(isoString: string): string {
  const [year, month] = isoString.split("-");
  return `${MONTHS[parseInt(month) - 1]} ${year}`;
}
