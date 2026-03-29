"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
        className="text-xs text-zinc-400 cursor-pointer hover:text-red-500 active:text-red-600 transition"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
        title="Eliminar presupuesto"
        description="El presupuesto será eliminado. Tus transacciones no se verán afectadas."
        confirmLabel="Eliminar"
        loading={loading}
      />
    </>
  );
}
