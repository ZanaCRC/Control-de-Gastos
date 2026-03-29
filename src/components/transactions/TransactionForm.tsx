"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { toDateInputValue } from "@/lib/utils";
import type { Tables } from "@/types/supabase";

interface Props {
  accounts: Tables<"accounts">[];
  categories: Tables<"categories">[];
  creditCards: Tables<"credit_cards">[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaultValues?: {
    type?: string;
    amount?: number;
    account_id?: string;
    category_id?: string;
    credit_card_id?: string;
    date?: string;
    description?: string;
  };
  submitLabel?: string;
}

export function TransactionForm({
  accounts,
  categories,
  creditCards,
  action,
  defaultValues = {},
  submitLabel = "Guardar transacción",
}: Props) {
  const [type, setType] = useState(defaultValues.type || "expense");
  const [selectedAccount, setSelectedAccount] = useState(
    defaultValues.account_id || accounts[0]?.id || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("type", type);
    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Type toggle */}
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Tipo
        </label>
        <div className="flex rounded-lg border border-zinc-200 p-0.5">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition ${
              type === "expense"
                ? "bg-red-50 text-red-700"
                : "text-zinc-500 hover:text-zinc-700 active:bg-zinc-50"
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition ${
              type === "income"
                ? "bg-emerald-50 text-emerald-700"
                : "text-zinc-500 hover:text-zinc-700 active:bg-zinc-50"
            }`}
          >
            Ingreso
          </button>
        </div>
      </div>

      {/* Amount */}
      <Input
        id="amount"
        name="amount"
        label="Monto"
        type="number"
        step="0.01"
        min="0.01"
        required
        placeholder="0"
        defaultValue={defaultValues.amount}
        className="text-2xl font-bold py-4"
      />

      {/* Account */}
      <Select
        id="account_id"
        name="account_id"
        label="Cuenta"
        options={accounts.map((a) => ({
          value: a.id,
          label: `${a.name} (${a.currency})`,
        }))}
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        required
      />

      {/* Category */}
      <Select
        id="category_id"
        name="category_id"
        label="Categoría"
        placeholder="Seleccionar categoría"
        options={categories.map((c) => ({
          value: c.id,
          label: c.name,
        }))}
        defaultValue={defaultValues.category_id || ""}
      />

      {/* Date */}
      <Input
        id="date"
        name="date"
        label="Fecha"
        type="date"
        required
        defaultValue={defaultValues.date || toDateInputValue()}
      />

      {/* Description */}
      <Input
        id="description"
        name="description"
        label="Descripción (opcional)"
        placeholder="Ej: Almuerzo, Uber, Supermercado..."
        defaultValue={defaultValues.description || ""}
      />

      {/* Credit card (only for expenses) */}
      {type === "expense" && creditCards.length > 0 && (
        <Select
          id="credit_card_id"
          name="credit_card_id"
          label="Tarjeta de crédito (opcional)"
          placeholder="Sin tarjeta"
          options={creditCards.map((cc) => ({
            value: cc.id,
            label: cc.name,
          }))}
          defaultValue={defaultValues.credit_card_id || ""}
        />
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
