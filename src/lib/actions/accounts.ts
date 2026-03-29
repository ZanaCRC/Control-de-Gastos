"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getAccounts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAccountById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = formData.get("name") as string;
  const currency = (formData.get("currency") as string) || "CRC";
  const balance = parseFloat(formData.get("balance") as string) || 0;

  const { data, error } = await supabase
    .from("accounts")
    .insert({ user_id: user!.id, name, currency, balance })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/accounts");
  return { data };
}

export async function updateAccount(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const currency = formData.get("currency") as string;

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
  const supabase = await createClient();

  const { error } = await supabase.from("accounts").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/accounts");
  redirect("/accounts");
}
