import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import * as adminService from "../../services/admin";
import type { AdminProject } from "../../services/admin";

export function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    adminService.getProjects()
      .then(setProjects)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setLoadingId(id);
    try {
      await adminService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setLoadingId(null);
    }
  }

  if (isLoading) return <p className="text-text-muted text-sm">Carregando...</p>;
  if (isError) return <p className="text-sm text-error">Erro ao carregar projetos.</p>;

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-primary-100 bg-bg-tertiary">
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Projeto</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Proprietário</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-bg-tertiary transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-medium text-text-primary">{p.name}</span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-text-muted mt-0.5 pl-4 truncate max-w-xs">{p.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="text-text-primary">{p.ownerName ?? "—"}</p>
                  <p className="text-xs text-text-muted">{p.ownerEmail ?? ""}</p>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    {confirmDeleteId === p.id ? (
                      <>
                        <Button
                          variant="danger"
                          className="!px-3 !py-1 text-xs"
                          disabled={loadingId === p.id}
                          onClick={() => handleDelete(p.id)}
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
                        onClick={() => setConfirmDeleteId(p.id)}
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length === 0 && (
          <p className="text-center text-text-muted text-sm py-8">Nenhum projeto encontrado.</p>
        )}
      </div>
    </Card>
  );
}
