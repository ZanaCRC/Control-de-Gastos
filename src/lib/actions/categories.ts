"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const createCategorySchema = z.object({
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

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false as const };
  return { authorized: true as const, supabase, user };
}

async function verifyCategoryOwnership(categoryId: string) {
  const auth = await getAuthenticatedUser();
  if (!auth.authorized) return { authorized: false as const };

  const { data: category } = await auth.supabase
    .from("categories")
    .select("user_id")
    .eq("id", categoryId)
    .single();

  if (!category || category.user_id !== auth.user.id)
    return { authorized: false as const };

  return auth;
}

export async function createDefaultCategories(userId: string) {
  const supabase = await createClient();

  const allCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...DEFAULT_INCOME_CATEGORIES,
  ].map((cat) => ({
    user_id: userId,
    name: cat.name,
    color: cat.color,
    icon: cat.icon,
  }));

  const { error } = await supabase.from("categories").insert(allCategories);

  if (error) return { error: error.message };
  return {};
}

export async function createCategory(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const parsed = createCategorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const auth = await getAuthenticatedUser();
  if (!auth.authorized) return { error: "No autorizado" };

  const { name, color, icon } = parsed.data;
  const { error } = await auth.supabase
    .from("categories")
    .insert({ user_id: auth.user.id, name, color, icon: icon ?? null });

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}

export async function updateCategory(id: string, formData: FormData) {
  const result = await verifyCategoryOwnership(id);
  if (!result.authorized) return { error: "No autorizado" };

  const name = formData.get("name") as string;
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string | null;

  const { error } = await result.supabase
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

  const { error } = await result.supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/categories");
  revalidatePath("/");
  return {};
}
