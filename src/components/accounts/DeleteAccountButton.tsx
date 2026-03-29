"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/actions/accounts";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function DeleteAccountButton({ id, name }: { id: string; name: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await deleteAccount(id);
    if (result?.error) {
      toast(result.error, "error");
      setOpen(false);
      setLoading(false);
    }
    // On success, deleteAccount redirects to /accounts
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg px-3 py-1.5 text-sm text-red-600 cursor-pointer hover:bg-red-50 active:bg-red-100 transition"
      >
        Eliminar
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={`Eliminar "${name}"`}
        description="Se eliminarán todas las transacciones y categorías asociadas a esta cuenta. Esta acción no se puede deshacer."
        confirmLabel="Eliminar cuenta"
        loading={loading}
      />
    </>
  );
}
