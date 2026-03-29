import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDateShort, getMonthRange } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DeleteAccountButton } from "@/components/accounts/DeleteAccountButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (!account) notFound();

  const { start, end } = getMonthRange();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, categories(name, color)")
    .eq("account_id", id)
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false });

  const txList = transactions ?? [];
  const monthExpenses = txList
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const monthIncome = txList
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/accounts"
          aria-label="Volver"
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200 transition shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 15l-5-5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 truncate">{account.name}</h1>
          <p className="text-sm text-zinc-500">{account.currency}</p>
        </div>
        <DeleteAccountButton id={account.id} name={account.name} />
      </div>

      {/* Balance */}
      <Card className="bg-zinc-900 text-white border-zinc-800">
        <p className="text-sm text-zinc-400">Balance</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </Card>

      {/* Month summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Ingresos del mes</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5">
            {formatCurrency(monthIncome, account.currency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-zinc-500">Gastos del mes</p>
          <p className="text-lg font-bold text-red-600 mt-0.5">
            {formatCurrency(monthExpenses, account.currency)}
          </p>
        </Card>
      </div>

      {/* Transactions this month */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
          Transacciones del mes
        </h3>
        {txList.length === 0 ? (
          <p className="text-sm text-zinc-400 py-8 text-center">
            Sin transacciones este mes.
          </p>
        ) : (
          <Card className="divide-y divide-zinc-100 p-0">
            {txList.map((t) => {
              const cat = t.categories as { name: string; color: string } | null;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                      style={{
                        backgroundColor: `${cat?.color ?? "#71717a"}18`,
                        color: cat?.color ?? "#71717a",
                      }}
                    >
                      {(cat?.name ?? "?")[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {t.description || cat?.name || "Transacción"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {formatDateShort(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "expense" ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {t.type === "expense" ? "-" : "+"}
                    {formatCurrency(t.amount, account.currency)}
                  </span>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
