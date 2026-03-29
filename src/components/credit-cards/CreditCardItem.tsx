"use client";

import { useRouter } from "next/navigation";
import { deleteCreditCard } from "@/lib/actions/credit-cards";

export function CreditCardItem({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`¿Eliminar la tarjeta "${name}"?`)) return;
    const result = await deleteCreditCard(id);
    if (result?.error) {
      alert(result.error);
    } else {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-zinc-400 hover:text-red-500 transition"
    >
      Eliminar
    </button>
  );
}
