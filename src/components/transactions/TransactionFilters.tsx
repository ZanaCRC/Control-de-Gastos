"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Tables } from "@/types/supabase";

interface Props {
  accounts: Tables<"accounts">[];
  categories: Tables<"categories">[];
  currentFilters: {
    type?: string;
    account?: string;
    category?: string;
    from?: string;
    to?: string;
  };
  defaultStart: string;
  defaultEnd: string;
}

export function TransactionFilters({
  accounts,
  categories,
  currentFilters,
  defaultStart,
  defaultEnd,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/transactions?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-2">
      {/* Tipo */}
      <select
        value={currentFilters.type || "all"}
        onChange={(e) => updateFilter("type", e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none"
      >
        <option value="all">Todos</option>
        <option value="expense">Gastos</option>
        <option value="income">Ingresos</option>
      </select>

      {/* Cuenta */}
      {accounts.length > 1 && (
        <select
          value={currentFilters.account || ""}
          onChange={(e) => updateFilter("account", e.target.value)}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none"
        >
          <option value="">Todas las cuentas</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      {/* Categoría */}
      <select
        value={currentFilters.category || ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Fechas */}
      <input
        type="date"
        value={currentFilters.from || defaultStart}
        onChange={(e) => updateFilter("from", e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none"
      />
      <input
        type="date"
        value={currentFilters.to || defaultEnd}
        onChange={(e) => updateFilter("to", e.target.value)}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 outline-none"
      />
    </div>
  );
}
