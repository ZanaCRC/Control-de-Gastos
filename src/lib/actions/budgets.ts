"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBudget(formData: FormData) {
  const supabase = await createClient();

  const categoryId = formData.get("category_id") as string;
  const amountLimit = parseFloat(formData.get("amount_limit") as string);
  const period = formData.get("period") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  const { error } = await supabase.from("budgets").insert({
    category_id: categoryId,
    amount_limit: amountLimit,
    period,
    start_date: startDate,
    end_date: endDate,
  });

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return {};
}

export async function updateBudget(id: string, formData: FormData) {
  const supabase = await createClient();

  const amountLimit = parseFloat(formData.get("amount_limit") as string);
  const period = formData.get("period") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  const { error } = await supabase
    .from("budgets")
    .update({
      amount_limit: amountLimit,
      period,
      start_date: startDate,
      end_date: endDate,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return {};
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("budgets").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/budgets");
  revalidatePath("/");
  return {};
}
