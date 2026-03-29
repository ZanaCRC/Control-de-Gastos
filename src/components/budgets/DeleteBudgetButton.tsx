"use client";

import { useRouter } from "next/navigation";
import { deleteBudget } from "@/lib/actions/budgets";

export function DeleteBudgetButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("¿Eliminar este presupuesto?")) return;
    const result = await deleteBudget(id);
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
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
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
