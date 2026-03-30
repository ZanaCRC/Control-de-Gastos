import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { DeleteBudgetButton } from "@/components/budgets/DeleteBudgetButton";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id);

  const accountIds = (accounts ?? []).map((a) => a.id);
  const defaultCurrency = accounts?.[0]?.currency ?? "CRC";

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user!.id);

  const categoryIds = (categories ?? []).map((c) => c.id);

  // Get active budgets
  const today = new Date().toISOString().split("T")[0];
  const { data: budgets } = categoryIds.length
    ? await supabase
        .from("budgets")
        .select("*, categories(id, name, color)")
        .in("category_id", categoryIds)
        .lte("start_date", today)
        .gte("end_date", today)
        .order("created_at", { ascending: false })
    : { data: [] };

  // Calculate spent for each budget
  const budgetsWithProgress = await Promise.all(
    (budgets ?? []).map(async (budget) => {
      const { data: txs } = await supabase
        .from("transactions")
        .select("amount")
        .eq("category_id", budget.category_id)
        .eq("type", "expense")
        .gte("date", budget.start_date)
        .lte("date", budget.end_date);

      const spent = (txs ?? []).reduce((s, t) => s + t.amount, 0);
      const percentage = budget.amount_limit > 0
        ? Math.round((spent / budget.amount_limit) * 100)
        : 0;

      return { ...budget, spent, percentage };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Presupuestos</h1>

      {budgetsWithProgress.length === 0 ? (
        <EmptyState
          title="Sin presupuestos"
          description="Crea presupuestos para controlar cuánto gastas por categoría."
        />
      ) : (
        <div className="space-y-3">
          {budgetsWithProgress.map((budget) => {
            const cat = budget.categories as {
              id: string;
              name: string;
              color: string;
            } | null;

            const barColor =
              budget.percentage > 85
                ? "#ef4444"
                : budget.percentage > 60
                  ? "#f59e0b"
                  : "#22c55e";

            return (
              <Card key={budget.id}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat?.color ?? "#71717a" }}
                    />
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {cat?.name ?? "Categoría"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-5 sm:ml-0">
                    <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                      {formatCurrency(budget.spent, defaultCurrency)} /{" "}
                      {formatCurrency(budget.amount_limit, defaultCurrency)}
                    </span>
                    <DeleteBudgetButton id={budget.id} />
                  </div>
                </div>
                <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(budget.percentage, 100)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1.5">
                  {budget.percentage}% usado &middot; {budget.period}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form para crear */}
      <Card>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Nuevo presupuesto
        </h3>
        <BudgetForm categories={categories ?? []} />
      </Card>
    </div>
  );
}
