"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createAccountAction } from "@/lib/actions/accounts";

const currencyOptions = [
  { value: "CRC", label: "Colones (CRC)" },
  { value: "USD", label: "Dólares (USD)" },
  { value: "EUR", label: "Euros (EUR)" },
];

export function NewAccountForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createAccountAction, null);

  useEffect(() => {
    if (state && !state.error) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
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
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? "Creando..." : "Agregar cuenta"}
      </Button>
    </form>
  );
}
