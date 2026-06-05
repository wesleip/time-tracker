import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { useWeeklyReport } from "../hooks/useEntries";

function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export function WeeklyReportPage() {
  const [anchorDate, setAnchorDate] = useState(() => getMondayOfWeek(new Date().toISOString().split("T")[0]));
  const { data: report, isLoading, isError } = useWeeklyReport(anchorDate);

  function changeWeek(delta: number) {
    const d = new Date(anchorDate + "T12:00:00");
    d.setDate(d.getDate() + delta * 7);
    setAnchorDate(d.toISOString().split("T")[0]);
  }

  const weekLabel = report
    ? `${new Date(report.weekStart + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${new Date(report.weekEnd + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`
    : "—";

  return (
    <Layout title="Semana">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => changeWeek(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </Button>
          <span className="text-base font-medium text-text-primary">{weekLabel}</span>
          <Button variant="secondary" onClick={() => changeWeek(1)}>
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
              <p className="text-sm text-text-secondary">Total da semana</p>
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
                  <p className="text-text-muted text-sm">Nenhum registro nesta semana.</p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
