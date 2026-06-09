import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import * as adminService from "../../services/admin";
import type { AdminTimeLog, AdminUser } from "../../services/admin";

export function AdminTimeLogs() {
  const [logs, setLogs] = useState<AdminTimeLog[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    adminService.getUsers().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    adminService.getTimeLogs(selectedUser || undefined)
      .then(setLogs)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [selectedUser]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="text-sm border border-primary-200 rounded-lg px-3 py-1.5 bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="">Todos os usuários</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <span className="text-xs text-text-muted">{logs.length} registro(s)</span>
      </div>

      {isLoading && <p className="text-text-muted text-sm">Carregando...</p>}
      {isError && <p className="text-sm text-error">Erro ao carregar registros.</p>}

      {!isLoading && !isError && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-100 bg-bg-tertiary">
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Usuário</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Projeto</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Descrição</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Horas</th>
                  <th className="text-left px-4 py-3 font-medium text-text-secondary">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-tertiary transition-colors">
                    <td className="px-4 py-3 text-text-primary">{log.ownerName ?? "—"}</td>
                    <td className="px-4 py-3 text-text-secondary">{log.projectName}</td>
                    <td className="px-4 py-3 text-text-muted max-w-xs truncate">{log.description ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-text-primary">{log.hours.toFixed(1)}h</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(log.date).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p className="text-center text-text-muted text-sm py-8">Nenhum registro encontrado.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
