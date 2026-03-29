"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import type { Tables } from "@/types/supabase";

const COLOR_PALETTE = [
  "#ef4444", "#f59e0b", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#f97316", "#14b8a6", "#71717a",
];

interface Props {
  categories: Tables<"categories">[];
}

export function CategoryManager({ categories }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("color", selectedColor);
    const result = await createCategory(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setShowForm(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteCategory(deleteTarget.id);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Categoría eliminada", "success");
      router.refresh();
    }
    setDeleteTarget(null);
    setDeleting(false);
  }

  return (
    <div>
      <div className="space-y-1 mb-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between py-1.5 group"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: cat.color ?? "#71717a" }}
              />
              <span className="text-sm text-zinc-700">{cat.name}</span>
            </div>
            <button
              onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
              aria-label={`Eliminar ${cat.name}`}
              className="rounded-lg p-2.5 sm:p-1.5 text-zinc-400 cursor-pointer hover:text-red-600 hover:bg-red-50 active:bg-red-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form action={handleCreate} className="space-y-3">
          <Input
            id="cat-name"
            name="name"
            label="Nombre"
            placeholder="Nueva categoría"
            required
          />
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-7 w-7 rounded-full border-2 cursor-pointer transition hover:scale-110 active:scale-95 ${
                    selectedColor === color
                      ? "border-zinc-900 scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} variant="primary">
              {loading ? "Creando..." : "Crear"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setShowForm(true)}
          className="text-xs"
        >
          + Agregar categoría
        </Button>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Eliminar "${deleteTarget?.name ?? ""}"`}
        description="Las transacciones con esta categoría quedarán sin categoría asignada."
        confirmLabel="Eliminar"
        loading={deleting}
      />
    </div>
  );
}
