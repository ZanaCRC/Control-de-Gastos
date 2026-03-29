import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { updateTransaction } from "@/lib/actions/transactions";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get transaction
  const { data: transaction } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();

  if (!transaction) notFound();

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

  const boundUpdate = updateTransaction.bind(null, id);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/transactions"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">
          Editar transacción
        </h1>
      </div>

      <Card>
        <TransactionForm
          accounts={accounts ?? []}
          categories={categories ?? []}
          creditCards={creditCards ?? []}
          action={boundUpdate}
          defaultValues={{
            type: transaction.type,
            amount: transaction.amount,
            account_id: transaction.account_id,
            category_id: transaction.category_id ?? undefined,
            credit_card_id: transaction.credit_card_id ?? undefined,
            date: transaction.date,
            description: transaction.description ?? undefined,
          }}
          submitLabel="Actualizar transacción"
        />
      </Card>
    </div>
  );
}
