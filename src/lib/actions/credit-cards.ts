"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const creditCardSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50),
  cut_off_day: z.coerce.number().int().min(1, "Día mínimo: 1").max(31, "Día máximo: 31"),
  payment_due_day: z.coerce.number().int().min(1, "Día mínimo: 1").max(31, "Día máximo: 31"),
});

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

async function verifyCreditCardOwnership(supabase: Awaited<ReturnType<typeof createClient>>, cardId: string, userId: string) {
  const { data } = await supabase
    .from("credit_cards")
    .select("user_id")
    .eq("id", cardId)
    .single();
  return data?.user_id === userId;
}

export async function getCreditCards() {
  const { supabase, user } = await getAuthenticatedUser();

  const { data, error } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCreditCardAction(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  return createCreditCard(formData);
}

export async function createCreditCard(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const parsed = creditCardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, cut_off_day, payment_due_day } = parsed.data;

  const { error } = await supabase.from("credit_cards").insert({
    user_id: user.id,
    name,
    cut_off_day,
    payment_due_day,
  });

  if (error) return { error: error.message };

  revalidatePath("/credit-cards");
  return {};
}

export async function updateCreditCard(id: string, formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await verifyCreditCardOwnership(supabase, id, user.id))) {
    return { error: "No autorizado" };
  }

  const parsed = creditCardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { name, cut_off_day, payment_due_day } = parsed.data;

  const { error } = await supabase
    .from("credit_cards")
    .update({ name, cut_off_day, payment_due_day })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/credit-cards");
  return {};
}

export async function deleteCreditCard(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await verifyCreditCardOwnership(supabase, id, user.id))) {
    return { error: "No autorizado" };
  }

  const { error } = await supabase.from("credit_cards").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/credit-cards");
  return {};
}
