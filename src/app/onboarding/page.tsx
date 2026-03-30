"use client";

import { useActionState } from "react";
import Image from "next/image";
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
  const [state, formAction, isPending] = useActionState(createAccountWithDefaults, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Finzo" width={160} height={50} className="mx-auto" priority />
          <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Bienvenido a Finzo
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Para empezar, crea tu primera cuenta. Puede ser tu cuenta de banco,
            billetera o cualquier forma en que manejes dinero.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-8">
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
              <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg px-3.5 py-2.5">
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
