"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCreditCardAction } from "@/lib/actions/credit-cards";

export function CreditCardForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createCreditCardAction, null);

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
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending} variant="secondary">
        {isPending ? "Creando..." : "Agregar tarjeta"}
      </Button>
    </form>
  );
}
