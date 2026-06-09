import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import * as adminService from "../../services/admin";
import type { AdminOverview as AdminOverviewData } from "../../services/admin";

export function AdminOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    adminService.getOverview()
      .then(setData)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-text-muted text-sm">Carregando...</p>;
  if (isError || !data) return <p className="text-sm text-error">Erro ao carregar visão geral.</p>;

  const stats = [
    { label: "Usuários", value: data.totalUsers, unit: "", color: "#7fa391" },
    { label: "Projetos", value: data.totalProjects, unit: "", color: "#8294a5" },
    { label: "Registros", value: data.totalEntries, unit: "", color: "#9bc9a8" },
    { label: "Horas totais", value: data.totalHours.toFixed(1), unit: "h", color: "#a9c5d8" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5" style={{ borderLeft: `4px solid ${s.color}` }}>
            <p className="text-sm text-text-secondary">{s.label}</p>
            <p className="text-2xl font-semibold text-text-primary mt-1">
              {s.value}{s.unit}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
