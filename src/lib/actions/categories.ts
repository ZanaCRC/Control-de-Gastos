"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const createCategorySchema = z.object({
  account_id: z.string().uuid("ID de cuenta inválido"),
  name: z.string().min(1, "El nombre es requerido").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido").default("#71717a"),
  icon: z.string().max(30).nullable().optional(),
});

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Alimentación", color: "#f59e0b", icon: "utensils" },
  { name: "Transporte", color: "#3b82f6", icon: "car" },
  { name: "Entretenimiento", color: "#8b5cf6", icon: "gamepad" },
  { name: "Salud", color: "#ef4444", icon: "heart" },
  { name: "Educación", color: "#06b6d4", icon: "book" },
  { name: "Hogar", color: "#10b981", icon: "home" },
  { name: "Servicios", color: "#6366f1", icon: "zap" },
  { name: "Otros", color: "#71717a", icon: "more" },
];

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salario", color: "#22c55e", icon: "briefcase" },
  { name: "Freelance", color: "#14b8a6", icon: "laptop" },
  { name: "Otros ingresos", color: "#a3e635", icon: "plus" },
];

async function verifyAccountOwnership(accountId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false as const };

  const { data } = await supabase
    .from("accounts")
    .select("user_id")
    .eq("id", accountId)
    .single();

  if (!data || data.user_id !== user.id) return { authorized: false as const };
  return { authorized: true as const, supabase, user };
}

async function verifyCategoryOwnership(categoryId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false as const };

  const { data: category } = await supabase
    .from("categories")
    .select("account_id, accounts(user_id)")
    .eq("id", categoryId)
    .single();

  if (!category) return { authorized: false as const };
  const accountOwner = (category.accounts as { user_id: string } | null)?.user_id;
  if (accountOwner !== user.id) return { authorized: false as const };

  return { authorized: true as const, supabase, user };
}

export async function createDefaultCategories(accountId: string) {
  const result = await verifyAccountOwnership(accountId);
  if (!result.authorized) return { error: "No autorizado" };

  const { supabase } = result;
  const allCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES,
  ].map((cat) => ({
    account_id: accountId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
  }));

  const { error } = await supabase.from("categories").insert(allCategories);

  if (error) return { error: error.message };
  return {};
}

export async function getCategoriesByAccount(accountId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("account_id", accountId)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCategory(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { account_id, name, color, icon } = parsed.data;

  const result = await verifyAccountOwnership(account_id);
  if (!result.authorized) return { error: "No autorizado" };

  const { supabase } = result;
  const { error } = await supabase
    .from("categories")
    .insert({ account_id, name, color, icon: icon ?? null });

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}

export async function updateCategory(id: string, formData: FormData) {
  const result = await verifyCategoryOwnership(id);
  if (!result.authorized) return { error: "No autorizado" };

  const { supabase } = result;
  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string | null;

  const { error } = await supabase
    .from("categories")
    .update({ name, color, icon })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}

export async function deleteCategory(id: string) {
  const result = await verifyCategoryOwnership(id);
  if (!result.authorized) return { error: "No autorizado" };

  const { supabase } = result;
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}
