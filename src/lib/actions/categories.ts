"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

export async function createDefaultCategories(accountId: string) {
  const supabase = await createClient();

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
  const supabase = await createClient();

  const accountId = formData.get("account_id") as string;
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#71717a";
  const icon = (formData.get("icon") as string) || null;

  const { error } = await supabase
    .from("categories")
    .insert({ account_id: accountId, name, color, icon });

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();

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
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}
