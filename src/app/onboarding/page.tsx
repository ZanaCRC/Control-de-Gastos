"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createAccountWithDefaults } from "./actions";

const currencyOptions = [
  { value: "CRC", label: "Colones (CRC)" },
  { value: "USD", label: "Dólares (USD)" },
  { value: "EUR", label: "Euros (EUR)" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createAccountWithDefaults, null);

  useEffect(() => {
    if (state === null && !isPending) return;
    // null means success (action returned null)
    if (state === null) router.push("/");
  }, [state, isPending, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Bienvenido a Control de Gastos
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Para empezar, crea tu primera cuenta. Puede ser tu cuenta de banco,
            billetera o cualquier forma en que manejes dinero.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
          <form action={formAction} className="space-y-5">
            <Input
              id="name"
              name="name"
              label="Nombre de la cuenta"
              placeholder="Ej: Cuenta principal, Billetera, BAC..."
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
              min="0"
              placeholder="0"
              defaultValue="0"
            />

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {state.error}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Creando cuenta..." : "Crear cuenta y empezar"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Se crearán categorías predeterminadas automáticamente.
        </p>
      </div>
    </div>
  );
}
