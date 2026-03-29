"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createAccount } from "@/lib/actions/accounts";
import { createDefaultCategories } from "@/lib/actions/categories";

const currencyOptions = [
  { value: "CRC", label: "Colones (CRC)" },
  { value: "USD", label: "Dólares (USD)" },
  { value: "EUR", label: "Euros (EUR)" },
];

export function NewAccountForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await createAccount(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result?.data) {
      await createDefaultCategories(result.data.id);
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          id="name"
          name="name"
          label="Nombre"
          placeholder="Ej: BAC, Billetera"
          required
        />
        <Select
          id="currency"
          name="currency"
          label="Moneda"
          options={currencyOptions}
          defaultValue="CRC"
        />
        <Input
          id="balance"
          name="balance"
          label="Saldo inicial"
          type="number"
          step="0.01"
          defaultValue="0"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" disabled={loading} variant="secondary">
        {loading ? "Creando..." : "Agregar cuenta"}
      </Button>
    </form>
  );
}
