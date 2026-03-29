"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTransaction } from "@/lib/actions/transactions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await deleteTransaction(id);
    if (result?.error) {
      toast(result.error, "error");
      setOpen(false);
    } else {
      toast("Transacción eliminada", "success");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Eliminar transacción"
        className="rounded p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M4.5 4.5l7 7M11.5 4.5l-7 7"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Eliminar transacción"
        description="Esta acción no se puede deshacer. El balance de la cuenta se actualizará automáticamente."
        confirmLabel="Eliminar"
        loading={loading}
      />
    </>
  );
}
