import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { createTransaction } from "@/lib/actions/transactions";
import { BackButton } from "@/components/ui/BackButton";

export default async function NewTransactionPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user!.id);

  const { data: creditCards } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user!.id);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/transactions" />
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
