import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, getMonthRange, getMonthName, formatDateShort } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  // Fetch accounts
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id);

  const totalBalance = (accounts ?? []).reduce(
    (sum, acc) => sum + acc.balance,
    0
  );

  // Fetch current month transactions
  const { start, end } = getMonthRange();
  const accountIds = (accounts ?? []).map((a) => a.id);

  const { data: monthTransactions } = accountIds.length
    ? await supabase
        .from("transactions")
        .select("*, categories(name, color)")
        .in("account_id", accountIds)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })
    : { data: [] };

  const transactions = monthTransactions ?? [];

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const expensesByCategory: Record<string, { name: string; color: string; total: number }> = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const catName = (t.categories as { name: string; color: string } | null)?.name ?? "Sin categoría";
      const catColor = (t.categories as { name: string; color: string } | null)?.color ?? "#71717a";
      if (!expensesByCategory[catName]) {
        expensesByCategory[catName] = { name: catName, color: catColor, total: 0 };
      }
      expensesByCategory[catName].total += t.amount;
    });

  const categoryList = Object.values(expensesByCategory).sort(
    (a, b) => b.total - a.total
  );

  const recentTransactions = transactions.slice(0, 8);
  const defaultCurrency = accounts?.[0]?.currency ?? "CRC";

  return (
    <div className="space-y-6">
      {/* Balance total */}
      <Card className="bg-zinc-900 text-white border-zinc-800">
        <p className="text-sm text-zinc-400">Balance total</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
          {formatCurrency(totalBalance, defaultCurrency)}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          {(accounts ?? []).length} cuenta{(accounts ?? []).length !== 1 ? "s" : ""}
        </p>
      </Card>

      {/* Resumen del mes */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-3 capitalize">
          {getMonthName()}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-sm text-zinc-500">Ingresos</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 truncate">
              {formatCurrency(totalIncome, defaultCurrency)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-500">Gastos</p>
            <p className="text-lg sm:text-xl font-bold text-red-600 mt-1 truncate">
              {formatCurrency(totalExpenses, defaultCurrency)}
            </p>
          </Card>
        </div>
      </div>

      {/* Gasto por categoría */}
      {categoryList.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">
            Gastos por categoría
          </h3>
          <div className="space-y-3">
            {categoryList.map((cat) => {
              const percentage =
                totalExpenses > 0
                  ? Math.round((cat.total / totalExpenses) * 100)
                  : 0;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-zinc-700">{cat.name}</span>
                    </div>
                    <span className="font-medium text-zinc-900">
                      {formatCurrency(cat.total, defaultCurrency)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-100">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Últimas transacciones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900">
            Últimas transacciones
          </h3>
          <Link
            href="/transactions"
            className="text-sm text-zinc-500 hover:text-zinc-900 transition"
          >
            Ver todas
          </Link>
        </div>
        {recentTransactions.length === 0 ? (
          <EmptyState
            title="Sin transacciones"
            description="Registra tu primer gasto o ingreso para empezar a llevar el control."
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
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                    style={{
                      backgroundColor: `${(t.categories as { color: string } | null)?.color ?? "#71717a"}18`,
                      color: (t.categories as { color: string } | null)?.color ?? "#71717a",
                    }}
                  >
                    {((t.categories as { name: string } | null)?.name ?? "?")[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {t.description || (t.categories as { name: string } | null)?.name || "Transacción"}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {formatDateShort(t.date)}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold whitespace-nowrap ${
                    t.type === "expense" ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {t.type === "expense" ? "-" : "+"}
                  {formatCurrency(t.amount, defaultCurrency)}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Botón flotante para agregar transacción */}
      <Link
        href="/transactions/new"
        aria-label="Agregar nueva transacción"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg hover:bg-zinc-700 active:bg-zinc-800 active:scale-95 transition"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </Link>
    </div>
  );
}
