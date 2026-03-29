"use server";

import { createClient } from "@/lib/supabase/server";
import { createDefaultCategories } from "@/lib/actions/categories";

export async function createAccountWithDefaults(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const name = formData.get("name") as string;
  const currency = (formData.get("currency") as string) || "CRC";
  const balance = parseFloat(formData.get("balance") as string) || 0;

  // Create account
  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .insert({ user_id: user.id, name, currency, balance })
    .select()
    .single();

  if (accountError) return { error: accountError.message };

  // Create default categories
  const catResult = await createDefaultCategories(account.id);
  if (catResult.error) return { error: catResult.error };

  return {};
}
