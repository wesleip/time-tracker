import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskNotifications } from "../../hooks/useTaskNotifications";
import type { Task } from "../../types";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: "Urgente",
    2: "Alta",
    3: "Normal",
    4: "Baixa",
  };
  return labels[priority] ?? "Normal";
}

function NotificationItem({ task }: { task: Task & { isOverdue: boolean; isDueToday: boolean } }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/tarefas")}
      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-bg-tertiary transition-colors text-left cursor-pointer"
    >
      <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${task.isOverdue ? "bg-red-500" : "bg-amber-500"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {task.isOverdue && (
            <span className="text-xs text-red-600 font-medium">Venceu {formatDate(task.dueDate!)}</span>
          )}
          {task.isDueToday && <span className="text-xs text-amber-600 font-medium">Vence hoje</span>}
          <span className="text-xs text-text-muted">{getPriorityLabel(task.priority)}</span>
        </div>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { notifications, overdueCount, dueTodayCount, totalCount, isLoading } = useTaskNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg text-text-secondary hover:bg-bg-tertiary transition-colors cursor-pointer"
        aria-label="Notificações"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
            {totalCount > 99 ? "99+" : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-primary-100 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-primary-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
            {(overdueCount > 0 || dueTodayCount > 0) && (
              <div className="flex items-center gap-2 text-xs">
                {overdueCount > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {overdueCount} vencido{overdueCount > 1 ? "s" : ""}
                  </span>
                )}
                {dueTodayCount > 0 && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {dueTodayCount} hoje
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-4 text-sm text-text-muted text-center">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="px-3 py-6 text-sm text-text-muted text-center">
                Nenhuma task pendente com prazo
              </div>
            ) : (
              <div className="py-1">
                {notifications.map((task) => (
                  <NotificationItem key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-3 py-2 border-t border-primary-100">
              <button
                onClick={() => navigate("/tarefas")}
                className="w-full text-center text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                Ver todas as tarefas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
