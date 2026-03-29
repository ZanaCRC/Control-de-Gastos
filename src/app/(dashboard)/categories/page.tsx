import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CategoryManager } from "@/components/categories/CategoryManager";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const accountIds = (accounts ?? []).map((a) => a.id);

  const { data: categories } = accountIds.length
    ? await supabase
        .from("categories")
        .select("*")
        .in("account_id", accountIds)
        .order("name", { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Categorías</h1>

      {(accounts ?? []).map((account) => {
        const accountCategories = (categories ?? []).filter(
          (c) => c.account_id === account.id
        );

        return (
          <Card key={account.id}>
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">
              {account.name}
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {accountCategories.map((cat) => (
                <Badge key={cat.id} color={cat.color ?? "#71717a"}>
                  {cat.name}
                </Badge>
              ))}
              {accountCategories.length === 0 && (
                <p className="text-sm text-zinc-400">Sin categorías</p>
              )}
            </div>
            <CategoryManager
              accountId={account.id}
              categories={accountCategories}
            />
          </Card>
        );
      })}
    </div>
  );
}
