import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import * as adminService from "../../services/admin";
import type { AdminUser } from "../../services/admin";
import { useAuth } from "../../contexts/AuthContext";

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    adminService.getUsers()
      .then(setUsers)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleToggleAdmin(id: string) {
    setLoadingId(id);
    try {
      const updated = await adminService.toggleAdmin(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } finally {
      setLoadingId(null);
    }
  }

  async function handleDelete(id: string) {
    setLoadingId(id);
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setLoadingId(null);
    }
  }

  if (isLoading) return <p className="text-text-muted text-sm">Carregando...</p>;
  if (isError) return <p className="text-sm text-error">Erro ao carregar usuários.</p>;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary-100 bg-bg-tertiary">
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">E-mail</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Perfil</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Cadastro</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-bg-tertiary transition-colors">
                <td className="px-4 py-3 font-medium text-text-primary">{u.name}</td>
                <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.isAdmin
                      ? "bg-primary-100 text-primary-700"
                      : "bg-bg-tertiary text-text-muted"
                  }`}>
                    {u.isAdmin ? "Admin" : "Usuário"}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  {u.id !== currentUser?.id && (
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="secondary"
                        className="!px-3 !py-1 text-xs"
                        disabled={loadingId === u.id}
                        onClick={() => handleToggleAdmin(u.id)}
                      >
                        {u.isAdmin ? "Remover admin" : "Tornar admin"}
                      </Button>
                      {confirmDeleteId === u.id ? (
                        <>
                          <Button
                            variant="danger"
                            className="!px-3 !py-1 text-xs"
                            disabled={loadingId === u.id}
                            onClick={() => handleDelete(u.id)}
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="secondary"
                            className="!px-3 !py-1 text-xs"
                            onClick={() => setConfirmDeleteId(null)}
                          >
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="danger"
                          className="!px-3 !py-1 text-xs"
                          onClick={() => setConfirmDeleteId(u.id)}
                        >
                          Excluir
                        </Button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center text-text-muted text-sm py-8">Nenhum usuário encontrado.</p>
        )}
      </div>
    </Card>
  );
}
