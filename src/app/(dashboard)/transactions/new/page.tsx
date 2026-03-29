import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { createTransaction } from "@/lib/actions/transactions";
import Link from "next/link";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id);

  const accountIds = (accounts ?? []).map((a) => a.id);

  const { data: categories } = accountIds.length
    ? await supabase
        .from("categories")
        .select("*")
        .in("account_id", accountIds)
    : { data: [] };

  const { data: creditCards } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user!.id);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          aria-label="Volver"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">
          Nueva transacción
        </h1>
      </div>

      <Card>
        <TransactionForm
          accounts={accounts ?? []}
          categories={categories ?? []}
          creditCards={creditCards ?? []}
          action={createTransaction}
        />
      </Card>
    </div>
  );
}
