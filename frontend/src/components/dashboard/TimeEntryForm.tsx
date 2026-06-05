import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { useProjects } from "../../hooks/useProjects";
import { useCreateEntry, useUpdateEntry } from "../../hooks/useEntries";
import type { TimeEntryWithProject } from "../../types";

const entrySchema = z.object({
  projectId: z.string().min(1, "Selecione um projeto"),
  hours: z.coerce.number().min(0.1, "Mínimo de 0.1h").max(24, "Máximo de 24h"),
  description: z.string().max(500).optional(),
});

type EntryForm = z.output<typeof entrySchema>;

interface TimeEntryFormProps {
  date: string;
  entry?: TimeEntryWithProject | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function TimeEntryForm({ date, entry, open, onClose, onSaved }: TimeEntryFormProps) {
  const { data: projects } = useProjects();
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateEntry();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(entrySchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        projectId: entry?.projectId ?? "",
        hours: entry?.hours ?? undefined,
        description: entry?.description ?? "",
      });
    }
  }, [open, entry, reset]);

  async function onSubmit(data: EntryForm) {
    if (entry) {
      await updateEntry.mutateAsync({ id: entry.id, ...data });
    } else {
      await createEntry.mutateAsync({ ...data, date });
    }
    onSaved();
    onClose();
  }

  return (
    <Modal open={open} title={entry ? "Editar Registro" : "Novo Registro"} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Projeto</label>
          <select
            className="w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2 text-sm"
            {...register("projectId")}
          >
            <option value="">Selecione um projeto</option>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>}
        </div>
        <div>
          <Input
            label="Horas"
            type="number"
            step="0.5"
            min="0"
            placeholder="Ex: 2.5"
            {...register("hours")}
          />
          {errors.hours && <p className="text-red-500 text-xs mt-1">{errors.hours.message}</p>}
        </div>
        <div>
          <Input
            label="Descrição"
            placeholder="O que foi feito?"
            {...register("description")}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : entry ? "Atualizar" : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
