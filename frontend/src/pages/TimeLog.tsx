import { useMemo, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { StatCard } from "../components/dashboard/StatCard";
import { TimeEntryList } from "../components/dashboard/TimeEntryList";
import { TimeEntryForm } from "../components/dashboard/TimeEntryForm";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useDailyReport, useDeleteEntry, useEntries } from "../hooks/useEntries";
import { useProjects } from "../hooks/useProjects";
import type { TimeEntryWithProject } from "../types";

const today = () => new Date().toISOString().split("T")[0];

export function TimeLog() {
  const [date, setDate] = useState(today());
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntryWithProject | null>(null);
  const [search, setSearch] = useState("");

  const { data: report, isLoading, isError } = useDailyReport(date);
  const { data: projects } = useProjects();
  const { data: entries } = useEntries(date);
  const deleteEntry = useDeleteEntry();

  const projectMap = new Map(
    (projects ?? []).map((p) => [p.id, { name: p.name, color: p.color }])
  );

  const filteredEntries = useMemo(() => {
    const list = entries ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (e) =>
        e.description?.toLowerCase().includes(q) ||
        e.projectName.toLowerCase().includes(q)
    );
  }, [entries, search]);

  function changeDay(delta: number) {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setDate(d.toISOString().split("T")[0]);
  }

  const isToday = date === today();

  return (
    <Layout title="Registrar">
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => changeDay(-1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium text-text-primary">
                {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              {!isToday && (
                <button
                  className="text-xs text-primary-500 hover:text-primary-600 cursor-pointer"
                  onClick={() => setDate(today())}
                >
                  Voltar para hoje
                </button>
              )}
            </div>
            <Button variant="secondary" onClick={() => changeDay(1)} disabled={isToday}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </Button>
          </div>
          <Button onClick={() => { setEditingEntry(null); setFormOpen(true); }}>
            + Novo Registro
          </Button>
        </div>

        {isError && (
          <p className="text-sm text-error">Erro ao carregar dados. Tente novamente.</p>
        )}
        {isLoading && !isError && (
          <p className="text-text-muted text-sm">Carregando...</p>
        )}

        {report && (
          <StatCard
            title={`Total — ${new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long" })}`}
            hours={report.totalHours}
            bgColor="bg-[#f3f7f5]"
            borderColor="#7fa391"
          />
        )}

        <div className="max-w-xs">
          <Input
            label=""
            placeholder="Buscar registros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="!py-1.5"
          />
        </div>

        <TimeEntryList
          entries={filteredEntries}
          projects={projectMap}
          onDelete={(id) => deleteEntry.mutate(id)}
          onEdit={(entry) => { setEditingEntry(entry); setFormOpen(true); }}
        />

        <TimeEntryForm
          key={editingEntry?.id ?? "new"}
          date={date}
          entry={editingEntry}
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingEntry(null); }}
          onSaved={() => { setFormOpen(false); setEditingEntry(null); }}
        />
      </div>
    </Layout>
  );
}
