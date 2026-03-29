"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const budgetSchema = z.object({
  category_id: z.string().uuid("Categoría inválida"),
  amount_limit: z.coerce.number().positive("El límite debe ser mayor a 0"),
  period: z.enum(["monthly", "weekly", "yearly"], { message: "Período inválido" }),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de inicio inválida"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha de fin inválida"),
});

async function verifyBudgetOwnership(budgetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { authorized: false as const };

  const { data: budget } = await supabase
    .from("budgets")
    .select("id, categories(account_id, accounts(user_id))")
    .eq("id", budgetId)
    .single();

  if (!budget) return { authorized: false as const };

  const accounts = budget.categories as { account_id: string; accounts: { user_id: string } | null } | null;
  if (accounts?.accounts?.user_id !== user.id) return { authorized: false as const };

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

export async function createBudgetAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  return createBudget(formData);
}

export async function createBudget(formData: FormData) {
  const parsed = budgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { category_id, amount_limit, period, start_date, end_date } = parsed.data;

  const result = await verifyCategoryOwnership(category_id);
  if (!result.authorized) return { error: "No autorizado" };

  const { supabase } = result;
  const { error } = await supabase.from("budgets").insert({
    category_id,
    amount_limit,
    period,
    start_date,
    end_date,
  });

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return {};
}

export async function updateBudget(id: string, formData: FormData) {
  const result = await verifyBudgetOwnership(id);
  if (!result.authorized) return { error: "No autorizado" };

  const parsed = budgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { amount_limit, period, start_date, end_date } = parsed.data;

  const { supabase } = result;
  const { error } = await supabase
    .from("budgets")
    .update({ amount_limit, period, start_date, end_date })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return {};
}

export async function deleteBudget(id: string) {
  const result = await verifyBudgetOwnership(id);
  if (!result.authorized) return { error: "No autorizado" };

  const { supabase } = result;
  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return {};
}
