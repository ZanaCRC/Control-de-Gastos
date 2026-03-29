import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDateShort, getMonthRange } from "@/lib/utils";
import Link from "next/link";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionActions } from "@/components/transactions/TransactionActions";

interface Props {
  searchParams: Promise<{
    type?: string;
    account?: string;
    category?: string;
    from?: string;
    to?: string;
  }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();

  // Get accounts
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id);

  const accountIds = (accounts ?? []).map((a) => a.id);
  if (accountIds.length === 0) {
    return (
      <EmptyState
        title="Sin cuentas"
        description="Crea una cuenta para empezar a registrar transacciones."
      />
    );
  }

  // Get categories for filters
  const { data: allCategories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user!.id);

  // Build query
  const { start: defaultStart, end: defaultEnd } = getMonthRange();
  const startDate = params.from || defaultStart;
  const endDate = params.to || defaultEnd;

  let query = supabase
    .from("transactions")
    .select("*, categories(id, name, color), accounts(id, name, currency)")
    .in("account_id", accountIds)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type);
  }
  if (params.account) {
    query = query.eq("account_id", params.account);
  }
  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  const { data: transactions } = await query;
  const txList = transactions ?? [];

  const totalIncome = txList
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = txList
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const defaultCurrency = accounts?.[0]?.currency ?? "CRC";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Transacciones</h1>
        <Link
          href="/transactions/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 active:bg-zinc-800 transition"
        >
          + Nueva
        </Link>
      </div>

      {/* Filtros */}
      <TransactionFilters
        accounts={accounts ?? []}
        categories={allCategories ?? []}
        currentFilters={params}
        defaultStart={defaultStart}
        defaultEnd={defaultEnd}
      />

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-zinc-500">Ingresos</p>
          <p className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5 truncate">
            {formatCurrency(totalIncome, defaultCurrency)}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-zinc-500">Gastos</p>
          <p className="text-xs sm:text-sm font-bold text-red-600 mt-0.5 truncate">
            {formatCurrency(totalExpenses, defaultCurrency)}
          </p>
        </Card>
        <Card className="p-3 sm:p-4">
          <p className="text-xs text-zinc-500">Balance</p>
          <p className={`text-xs sm:text-sm font-bold mt-0.5 truncate ${totalIncome - totalExpenses >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {formatCurrency(totalIncome - totalExpenses, defaultCurrency)}
          </p>
        </Card>
      </div>

      {/* Lista */}
      {txList.length === 0 ? (
        <EmptyState
          title="Sin transacciones"
          description="No hay transacciones para los filtros seleccionados."
          action={
            <Link
              href="/transactions/new"
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 active:bg-zinc-800 transition"
            >
              Agregar transacción
            </Link>
          }
        />
      ) : (
        <Card className="divide-y divide-zinc-100 p-0">
          {txList.map((t) => {
            const cat = t.categories as { id: string; name: string; color: string } | null;
            const acc = t.accounts as { id: string; name: string; currency: string } | null;
            return (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 active:bg-zinc-100 transition group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
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
                      {acc && accounts && accounts.length > 1 && (
                        <span> &middot; {acc.name}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold whitespace-nowrap ${
                      t.type === "expense" ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {t.type === "expense" ? "-" : "+"}
                    {formatCurrency(t.amount, acc?.currency ?? defaultCurrency)}
                  </span>
                  <TransactionActions id={t.id} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
