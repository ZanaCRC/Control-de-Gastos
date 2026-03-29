"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createDefaultCategories } from "@/lib/actions/categories";

const onboardingSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  currency: z.enum(["CRC", "USD", "EUR"]).default("CRC"),
  balance: z.coerce.number().default(0),
});

export async function createAccountWithDefaults(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, currency, balance } = parsed.data;

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .insert({ user_id: user.id, name, currency, balance })
    .select()
    .single();

  if (accountError) return { error: accountError.message };

  const catResult = await createDefaultCategories(user.id);
  if (catResult.error) return { error: catResult.error };

  redirect("/");
}
