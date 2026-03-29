import { createClient } from "@/lib/supabase/server";
import { getMonthRange } from "@/lib/utils";
import { ReportsView } from "@/components/reports/ReportsView";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id);

  const accountIds = (accounts ?? []).map((a) => a.id);
  const defaultCurrency = accounts?.[0]?.currency ?? "CRC";

  // Get last 6 months of transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const startDate = new Date(
    sixMonthsAgo.getFullYear(),
    sixMonthsAgo.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const { end: endDate } = getMonthRange();

  const { data: transactions } = accountIds.length
    ? await supabase
        .from("transactions")
        .select("*, categories(id, name, color)")
        .in("account_id", accountIds)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Reportes</h1>
      <ReportsView
        transactions={transactions ?? []}
        currency={defaultCurrency}
      />
    </div>
  );
}
