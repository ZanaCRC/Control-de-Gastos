"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import type { Tables } from "@/types/supabase";

const COLOR_PALETTE = [
  "#ef4444", "#f59e0b", "#22c55e", "#10b981",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6",
  "#ec4899", "#f97316", "#14b8a6", "#71717a",
];

interface Props {
  accountId: string;
  categories: Tables<"categories">[];
}

export function CategoryManager({ accountId, categories }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("account_id", accountId);
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

  async function handleDelete(id: string, name: string) {
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return;
    const result = await deleteCategory(id);
    if (result?.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <div>
      {/* Existing categories with delete */}
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
              onClick={() => handleDelete(cat.id, cat.name)}
              className="text-xs text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {showForm ? (
        <form action={handleCreate} className="space-y-3">
          <Input
            id={`name-${accountId}`}
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
                  className={`h-7 w-7 rounded-full border-2 transition ${
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
    </div>
  );
}
