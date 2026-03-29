"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createBudget } from "@/lib/actions/budgets";
import { getMonthRange } from "@/lib/utils";
import type { Tables } from "@/types/supabase";

interface Props {
  categories: Tables<"categories">[];
}

const periodOptions = [
  { value: "monthly", label: "Mensual" },
  { value: "weekly", label: "Semanal" },
  { value: "yearly", label: "Anual" },
];

export function BudgetForm({ categories }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { start, end } = getMonthRange();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createBudget(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Select
          id="budget-category"
          name="category_id"
          label="Categoría"
          placeholder="Seleccionar"
          required
          options={categories.map((c) => ({
            value: c.id,
            label: c.name,
          }))}
        />
        <Input
          id="budget-limit"
          name="amount_limit"
          label="Límite"
          type="number"
          step="0.01"
          min="1"
          required
          placeholder="50000"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          id="budget-period"
          name="period"
          label="Período"
          options={periodOptions}
          defaultValue="monthly"
        />
        <Input
          id="budget-start"
          name="start_date"
          label="Inicio"
          type="date"
          required
          defaultValue={start}
        />
        <Input
          id="budget-end"
          name="end_date"
          label="Fin"
          type="date"
          required
          defaultValue={end}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} variant="secondary">
        {loading ? "Creando..." : "Crear presupuesto"}
      </Button>
    </form>
  );
}
