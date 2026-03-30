import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CategoryManager } from "@/components/categories/CategoryManager";

export default async function CategoriesPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user!.id)
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Categorías</h1>

      <Card>
        <div className="flex flex-wrap gap-2 mb-4">
          {(categories ?? []).map((cat) => (
            <Badge key={cat.id} color={cat.color ?? "#71717a"}>
              {cat.name}
            </Badge>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-sm text-zinc-400">Sin categorías</p>
          )}
        </div>
        <CategoryManager categories={categories ?? []} />
      </Card>
    </div>
  );
}
