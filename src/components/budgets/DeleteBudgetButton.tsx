"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteBudget } from "@/lib/actions/budgets";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function DeleteBudgetButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const result = await deleteBudget(id);
    if (result?.error) {
      toast(result.error, "error");
    } else {
      toast("Presupuesto eliminado", "success");
      router.refresh();
    }
    setOpen(false);
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Eliminar presupuesto"
        className="rounded-lg p-2.5 sm:p-1.5 text-zinc-400 cursor-pointer hover:text-red-600 hover:bg-red-50 active:bg-red-100 transition"
      >
        <FontAwesomeIcon icon={faTrash} className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Eliminar presupuesto"
        description="El presupuesto será eliminado. Tus transacciones no se verán afectadas."
        confirmLabel="Eliminar"
        loading={loading}
      />
    </>
  );
}
