"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCreditCard } from "@/lib/actions/credit-cards";

export function CreditCardForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createCreditCard(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          id="cc-name"
          name="name"
          label="Nombre"
          placeholder="Ej: Visa BAC"
          required
        />
        <Input
          id="cc-cut-off"
          name="cut_off_day"
          label="Día de corte"
          type="number"
          min="1"
          max="31"
          placeholder="15"
          required
        />
        <Input
          id="cc-payment"
          name="payment_due_day"
          label="Día de pago"
          type="number"
          min="1"
          max="31"
          placeholder="1"
          required
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} variant="secondary">
        {loading ? "Creando..." : "Agregar tarjeta"}
      </Button>
    </form>
  );
}
