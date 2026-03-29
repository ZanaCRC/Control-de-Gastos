"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  currency: z.enum(["CRC", "USD", "EUR"]).default("CRC"),
  balance: z.coerce.number().default(0),
});

const updateAccountSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  currency: z.enum(["CRC", "USD", "EUR"]),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

async function verifyAccountOwnership(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, accountId: string, userId: string) {
  const { data } = await supabase
    .from("accounts")
    .select("user_id")
    .eq("id", accountId)
    .single();
  if (!data || data.user_id !== userId) return false;
  return true;
}

export async function getAccounts() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAccountById(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createAccountAction(
  _prevState: { error?: string; data?: { id: string } } | null,
  formData: FormData
): Promise<{ error?: string; data?: { id: string } } | null> {
  return createAccount(formData) ?? null;
}

export async function createAccount(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const parsed = createAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, currency, balance } = parsed.data;

  const { data, error } = await supabase
    .from("accounts")
    .insert({ user_id: user.id, name, currency, balance })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/accounts");
  return { data };
}

export async function updateAccount(id: string, formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await verifyAccountOwnership(supabase, id, user.id))) {
    return { error: "No autorizado" };
  }

  const parsed = updateAccountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, currency } = parsed.data;

  const { error } = await supabase
    .from("accounts")
    .update({ name, currency })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/accounts");
  return {};
}

export async function deleteAccount(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await verifyAccountOwnership(supabase, id, user.id))) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase.from("accounts").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/accounts");
  redirect("/accounts");
}
