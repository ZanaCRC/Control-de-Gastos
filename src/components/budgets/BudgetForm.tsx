"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createBudgetAction } from "@/lib/actions/budgets";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createBudgetAction, null);

  const { start, end } = getMonthRange();

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? "Creando..." : "Crear presupuesto"}
      </Button>
    </form>
  );
}
