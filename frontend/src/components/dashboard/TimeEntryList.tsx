import { useState } from "react";
import type { TimeEntryWithProject } from "../../types";
import { formatTime } from "../../utils/date";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface TimeEntryListProps {
  entries: TimeEntryWithProject[];
  projects: Map<string, { name: string; color: string }>;
  onDelete: (id: string) => void;
  onEdit: (entry: TimeEntryWithProject) => void;
}

export function TimeEntryList({ entries, projects, onDelete, onEdit }: TimeEntryListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (entries.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-text-muted text-sm">Nenhum registro para este dia.</p>
        <p className="text-text-muted text-xs mt-1">Adicione seu primeiro lançamento acima.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const project = projects.get(entry.projectId);
        return (
          <Card key={entry.id} className="p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {project && <Badge color={project.color}>{project.name}</Badge>}
                <span className="text-sm font-medium text-text-primary">
                  {entry.hours.toFixed(1)}h
                </span>
              </div>
              <p className="text-sm text-text-secondary truncate">{entry.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-text-muted">{formatTime(entry.createdAt)}</span>
              <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => onEdit(entry)}>
                Editar
              </Button>
              {confirmDelete === entry.id ? (
                <div className="flex gap-1">
                  <Button variant="danger" className="!px-2 !py-1 text-xs" onClick={() => { onDelete(entry.id); setConfirmDelete(null); }}>
                    Confirmar
                  </Button>
                  <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => setConfirmDelete(null)}>
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => setConfirmDelete(entry.id)}>
                  Excluir
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
