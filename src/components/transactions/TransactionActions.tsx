"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteTransaction } from "@/lib/actions/transactions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export function TransactionActions({ id }: { id: string }) {
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
      <div className="flex items-center gap-1">
        <Link
          href={`/transactions/${id}/edit`}
          aria-label="Editar transacción"
          className="rounded-lg p-2.5 sm:p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 active:bg-blue-100 dark:active:bg-blue-900 transition"
        >
          <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Eliminar transacción"
          className="rounded-lg p-2.5 sm:p-1.5 text-zinc-400 cursor-pointer hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 active:bg-red-100 dark:active:bg-red-900 transition"
        >
          <FontAwesomeIcon icon={faTrash} className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
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
