"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCreditCards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user!.id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCreditCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = formData.get("name") as string;
  const cutOffDay = parseInt(formData.get("cut_off_day") as string);
  const paymentDueDay = parseInt(formData.get("payment_due_day") as string);

  const { error } = await supabase.from("credit_cards").insert({
    user_id: user!.id,
    name,
    cut_off_day: cutOffDay,
    payment_due_day: paymentDueDay,
  });

  if (error) return { error: error.message };

  revalidatePath("/credit-cards");
  return {};
}

export async function updateCreditCard(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const cutOffDay = parseInt(formData.get("cut_off_day") as string);
  const paymentDueDay = parseInt(formData.get("payment_due_day") as string);

  const { error } = await supabase
    .from("credit_cards")
    .update({ name, cut_off_day: cutOffDay, payment_due_day: paymentDueDay })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/credit-cards");
  return {};
}

export async function deleteCreditCard(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("credit_cards").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/credit-cards");
  return {};
}
