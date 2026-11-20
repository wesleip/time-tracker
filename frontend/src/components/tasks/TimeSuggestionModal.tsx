import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useCreateEntry } from "../../hooks/useEntries";
import { todayISO } from "../../utils/date";
import type { Task } from "../../types";

interface Props {
  task: Task | null;
  projectName: string;
  onClose: () => void;
}

/**
 * Sugere registrar horas quando uma tarefa com projeto vinculado é concluída.
 * A criação do registro é opcional: fechar o modal não registra nada.
 */
export function TimeSuggestionModal({ task, projectName, onClose }: Props) {
  const createEntry = useCreateEntry();
  // Estado inicial derivado da tarefa; o componente é remontado por chave na tela
  // (key={task.id}), então cada sugestão abre com os valores certos.
  const [hours, setHours] = useState("1");
  const [date, setDate] = useState(() => task?.dueDate ?? todayISO());
  const [description, setDescription] = useState(() => task?.title ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!task) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedHours = Number(hours);
    if (!Number.isFinite(parsedHours) || parsedHours <= 0 || parsedHours > 24) {
      setError("Informe um valor entre 0 e 24 horas.");
      return;
    }
    if (!date) {
      setError("Informe a data do registro.");
      return;
    }

    try {
      await createEntry.mutateAsync({
        projectId: task!.projectId!,
        date,
        hours: parsedHours,
        description: description || undefined,
      });
      onClose();
    } catch {
      setError("Não foi possível registrar as horas. Tente novamente.");
    }
  }

  return (
    <Modal open={!!task} title="Registrar tempo?" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-text-secondary">
          A tarefa <span className="font-medium text-text-primary">“{task.title}”</span> foi concluída e está
          vinculada ao projeto <span className="font-medium text-text-primary">{projectName}</span>. Deseja registrar
          as horas trabalhadas?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Horas"
            type="number"
            min="0.25"
            max="24"
            step="0.25"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <Input
          label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Agora não
          </Button>
          <Button type="submit" disabled={createEntry.isPending}>
            {createEntry.isPending ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
