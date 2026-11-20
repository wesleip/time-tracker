import { useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Timesheet } from "../components/reports/Timesheet";
import { useMonthlyReport } from "../hooks/useEntries";
import { fetchMonthlyReportPdf } from "../services/timeEntries";
import { downloadCsv, toCsv } from "../utils/csv";
import { downloadBlob } from "../utils/download";
import { formatMonthYear } from "../utils/date";

type View = "list" | "sheet";

export function MonthlyReportPage() {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [month, setMonth] = useState(currentMonth);
  const [view, setView] = useState<View>("list");
  const [pdfError, setPdfError] = useState(false);
  const { data: report, isLoading, isError } = useMonthlyReport(month);

  function changeMonth(delta: number) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  function exportCsv() {
    if (!report) return;
    const rows: (string | number)[][] = [["Data", "Projeto", "Horas"]];
    for (const day of report.days) {
      for (const project of day.projects) {
        rows.push([day.date, project.projectName, project.totalHours]);
      }
    }
    rows.push(["Total", "", report.totalHours]);
    downloadCsv(`relatorio-${month}.csv`, toCsv(rows));
  }

  async function exportPdf() {
    setPdfError(false);
    try {
      const blob = await fetchMonthlyReportPdf(month);
      downloadBlob(`relatorio-${month}.pdf`, blob);
    } catch {
      setPdfError(true);
    }
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
          <Button
            variant={view === "list" ? "primary" : "secondary"}
            className="ml-auto"
            onClick={() => setView("list")}
          >
            Lista
          </Button>
          <Button
            variant={view === "sheet" ? "primary" : "secondary"}
            onClick={() => setView("sheet")}
          >
            Planilha
          </Button>
          <Button
            variant="secondary"
            onClick={exportCsv}
            disabled={!report || report.days.length === 0}
          >
            Exportar CSV
          </Button>
          <Button
            variant="secondary"
            onClick={exportPdf}
            disabled={!report || report.days.length === 0}
          >
            Exportar PDF
          </Button>
        </div>

        {pdfError && (
          <p className="text-sm text-error">Não foi possível gerar o PDF. Tente novamente.</p>
        )}

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

            {view === "sheet" && report.days.length > 0 ? (
              <Timesheet days={report.days} />
            ) : (
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
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
