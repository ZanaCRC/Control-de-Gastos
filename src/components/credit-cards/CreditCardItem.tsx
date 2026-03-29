"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCreditCard } from "@/lib/actions/credit-cards";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function CreditCardItem({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await deleteCreditCard(id);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Tarjeta eliminada", "success");
      router.refresh();
    }
    setOpen(false);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-zinc-400 cursor-pointer hover:text-red-500 active:text-red-600 transition"
      >
        Eliminar
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={`Eliminar "${name}"`}
        description="Las transacciones asociadas a esta tarjeta no se eliminarán, pero perderán la referencia a la tarjeta."
        confirmLabel="Eliminar tarjeta"
        loading={loading}
      />
    </>
  );
}
