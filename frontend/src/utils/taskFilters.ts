import { addDays, toISODate } from "./date";

export type WhenFilter = "" | "today" | "tomorrow" | "week" | "nextWeek";

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const offset = (date.getDay() + 6) % 7; // segunda-feira = 0
  start.setDate(date.getDate() - offset);
  return start;
}

/**
 * Filtra tarefas por prazo de vencimento.
 * "week" = segunda a domingo da semana atual; "nextWeek" = a semana seguinte.
 */
export function matchesWhenFilter(dueDate: string | null, when: WhenFilter, now: Date = new Date()): boolean {
  if (!when) return true;
  if (!dueDate) return false;

  const weekStart = startOfWeek(now);

  if (when === "today") return dueDate === toISODate(now);
  if (when === "tomorrow") return dueDate === toISODate(addDays(now, 1));
  if (when === "nextWeek") {
    const nextWeekStart = toISODate(addDays(weekStart, 7));
    const nextWeekEnd = toISODate(addDays(weekStart, 13));
    return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
  }

  const weekEnd = toISODate(addDays(weekStart, 6));
  return dueDate >= toISODate(weekStart) && dueDate <= weekEnd;
}
