import { useMemo } from "react";
import { useTasks } from "./useTasks";

export function useTaskNotifications() {
  const { data, isLoading } = useTasks({ status: "pending" });
  const tasks = useMemo(() => data?.items ?? [], [data]);

  const notifications = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return tasks
      .filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        return dueDay <= today;
      })
      .map((task) => {
        const dueDate = new Date(task.dueDate!);
        const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const isOverdue = dueDay < today;
        const isDueToday = dueDay.getTime() === today.getTime();

        return {
          ...task,
          isOverdue,
          isDueToday,
        };
      })
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        if (a.isDueToday && !b.isDueToday) return -1;
        if (!a.isDueToday && b.isDueToday) return 1;
        return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
      });
  }, [tasks]);

  const overdueCount = notifications.filter((n) => n.isOverdue).length;
  const dueTodayCount = notifications.filter((n) => n.isDueToday).length;

  return {
    notifications,
    overdueCount,
    dueTodayCount,
    totalCount: notifications.length,
    isLoading,
  };
}
