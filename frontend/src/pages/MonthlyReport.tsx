import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useMonthlyReport } from "../hooks/useEntries";
import { formatMonthYear } from "../utils/date";

export function MonthlyReportPage() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(currentMonth);
  const { data: report, isLoading, isError } = useMonthlyReport(month);

  function changeMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <Layout title="Relatório Mensal">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => changeMonth(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </Button>
          <span className="text-lg font-medium text-text-primary">{formatMonthYear(month)}</span>
          <Button variant="secondary" onClick={() => changeMonth(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </Button>
        </div>

        {isError && (
          <p className="text-sm text-error">Erro ao carregar relatório. Tente novamente.</p>
        )}

        {isLoading && !isError && (
          <p className="text-text-muted text-sm">Carregando...</p>
        )}

        {report && (
          <>
            <Card className="p-4">
              <p className="text-sm text-text-secondary">Total do mês</p>
              <p className="text-3xl font-semibold text-text-primary mt-1">
                {report.totalHours.toFixed(1)}h
              </p>
            </Card>

            <div className="space-y-4">
              {report.days.map((day) => (
                <Card key={day.date} className="p-4">
                  <p className="text-sm font-medium text-text-primary mb-2">
                    {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                    {" — "}
                    <span className="font-semibold">{day.totalHours.toFixed(1)}h</span>
                  </p>
                  <div className="space-y-1">
                    {day.projects.map((p) => (
                      <div key={p.projectId} className="flex items-center justify-between">
                        <Badge color={p.projectColor}>{p.projectName}</Badge>
                        <span className="text-sm text-text-primary">{p.totalHours.toFixed(1)}h</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              {!isLoading && report.days.length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-text-muted text-sm">Nenhum registro neste mês.</p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
