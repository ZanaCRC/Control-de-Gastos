"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const transactionSchema = z.object({
  account_id: z.string().uuid("Cuenta inválida"),
  category_id: z.string().uuid().optional().nullable(),
  credit_card_id: z.string().uuid().optional().nullable(),
  type: z.enum(["expense", "income"], { message: "Tipo debe ser gasto o ingreso" }),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  description: z.string().max(500).optional().nullable(),
});

interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: "expense" | "income";
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  return { supabase, user };
}

async function getUserAccountIds(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", userId);
  return (data ?? []).map((a) => a.id);
}

async function verifyTransactionOwnership(supabase: Awaited<ReturnType<typeof createClient>>, transactionId: string, userId: string) {
  const { data } = await supabase
    .from("transactions")
    .select("id, account_id, accounts(user_id)")
    .eq("id", transactionId)
    .single();

  if (!data) return false;
  const owner = (data.accounts as { user_id: string } | null)?.user_id;
  return owner === userId;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const { supabase, user } = await getAuthenticatedUser();

  const accountIds = await getUserAccountIds(supabase, user.id);
  if (accountIds.length === 0) return [];

  let query = supabase
    .from("transactions")
    .select("*, categories(id, name, color, icon), accounts(id, name, currency)")
    .in("account_id", accountIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.accountId) query = query.eq("account_id", filters.accountId);
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.startDate) query = query.gte("date", filters.startDate);
  if (filters.endDate) query = query.lte("date", filters.endDate);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTransactionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(id, name, color), accounts(id, name, currency)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createTransaction(formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  const raw = Object.fromEntries(formData);
  // Normalize empty strings to null for optional UUID fields
  if (!raw.category_id) raw.category_id = null as unknown as string;
  if (!raw.credit_card_id) raw.credit_card_id = null as unknown as string;
  if (!raw.description) raw.description = null as unknown as string;

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { account_id, category_id, credit_card_id, type, amount, date, description } = parsed.data;

  // Verify account belongs to user
  const accountIds = await getUserAccountIds(supabase, user.id);
  if (!accountIds.includes(account_id)) return { error: "No autorizado" };

  const { error: txError } = await supabase.from("transactions").insert({
    account_id,
    category_id: category_id ?? null,
    credit_card_id: credit_card_id ?? null,
    type,
    amount,
    date,
    description: description ?? null,
  });

  if (txError) return { error: txError.message };

  // Update account balance
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", account_id)
    .single();

  if (account) {
    const newBalance =
      type === "income"
        ? account.balance + amount
        : account.balance - amount;

    await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", account_id);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  redirect("/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await verifyTransactionOwnership(supabase, id, user.id))) {
    return { error: "No autorizado" };
  }

  const raw = Object.fromEntries(formData);
  if (!raw.category_id) raw.category_id = null as unknown as string;
  if (!raw.credit_card_id) raw.credit_card_id = null as unknown as string;
  if (!raw.description) raw.description = null as unknown as string;

  const parsed = transactionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { account_id, category_id, credit_card_id, type, amount, date, description } = parsed.data;

  // Get original transaction to reverse balance
  const { data: original } = await supabase
    .from("transactions")
    .select("*, accounts(balance)")
    .eq("id", id)
    .single();

  if (!original) return { error: "Transacción no encontrada" };

  // Update transaction
  const { error: txError } = await supabase
    .from("transactions")
    .update({
      account_id,
      category_id: category_id ?? null,
      credit_card_id: credit_card_id ?? null,
      type,
      amount,
      date,
      description: description ?? null,
    })
    .eq("id", id);

  if (txError) return { error: txError.message };

  // Reverse old balance impact and apply new one
  const oldBalance = (original.accounts as { balance: number }).balance;
  const reversedBalance =
    original.type === "income"
      ? oldBalance - original.amount
      : oldBalance + original.amount;

  const newBalance =
    type === "income"
      ? reversedBalance + amount
      : reversedBalance - amount;

  await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", original.account_id);

  // If account changed, also update new account
  if (account_id !== original.account_id) {
    const { data: newAccount } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", account_id)
      .single();

    if (newAccount) {
      const updatedNewBalance =
        type === "income"
          ? newAccount.balance + amount
          : newAccount.balance - amount;

      await supabase
        .from("accounts")
        .update({ balance: updatedNewBalance })
        .eq("id", account_id);

      await supabase
        .from("accounts")
        .update({ balance: reversedBalance })
        .eq("id", original.account_id);
    }
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  redirect("/transactions");
}

export async function deleteTransaction(id: string) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!(await verifyTransactionOwnership(supabase, id, user.id))) {
    return { error: "No autorizado" };
  }

  const { data: transaction } = await supabase
    .from("transactions")
    .select("*, accounts(balance)")
    .eq("id", id)
    .single();

  if (!transaction) return { error: "Transacción no encontrada" };

  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  const currentBalance = (transaction.accounts as { balance: number }).balance;
  const newBalance =
    transaction.type === "income"
      ? currentBalance - transaction.amount
      : currentBalance + transaction.amount;

  await supabase
    .from("accounts")
    .update({ balance: newBalance })
    .eq("id", transaction.account_id);

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  return {};
}
