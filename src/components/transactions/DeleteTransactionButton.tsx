"use client";

import { useRouter } from "next/navigation";
import { deleteTransaction } from "@/lib/actions/transactions";

export function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const result = await deleteTransaction(id);
    if (result?.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4.5 4.5l7 7M11.5 4.5l-7 7"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
