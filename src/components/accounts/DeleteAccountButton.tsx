"use client";

import { deleteAccount } from "@/lib/actions/accounts";

export function DeleteAccountButton({ id, name }: { id: string; name: string }) {
  async function handleDelete() {
    if (
      !confirm(
        `¿Eliminar la cuenta "${name}"? Se eliminarán todas sus transacciones y categorías.`
      )
    )
      return;
    const result = await deleteAccount(id);
    if (result?.error) alert(result.error);
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 transition"
    >
      Eliminar
    </button>
  );
}
