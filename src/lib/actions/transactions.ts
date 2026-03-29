"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: "expense" | "income";
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user's account IDs
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user!.id);

  const accountIds = (accounts ?? []).map((a) => a.id);
  if (accountIds.length === 0) return [];

  let query = supabase
    .from("transactions")
    .select("*, categories(id, name, color, icon), accounts(id, name, currency)")
    .in("account_id", accountIds)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.accountId) {
    query = query.eq("account_id", filters.accountId);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.startDate) {
    query = query.gte("date", filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte("date", filters.endDate);
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
  }

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
  const supabase = await createClient();

  const accountId = formData.get("account_id") as string;
  const categoryId = formData.get("category_id") as string | null;
  const creditCardId = formData.get("credit_card_id") as string | null;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const description = (formData.get("description") as string) || null;

  if (!amount || amount <= 0) return { error: "El monto debe ser mayor a 0" };
  if (!accountId) return { error: "Selecciona una cuenta" };
  if (!date) return { error: "Selecciona una fecha" };

  // Insert transaction
  const { error: txError } = await supabase.from("transactions").insert({
    account_id: accountId,
    category_id: categoryId || null,
    credit_card_id: creditCardId || null,
    type,
    amount,
    date,
    description,
  });

  if (txError) return { error: txError.message };

  // Update account balance
  const { data: account } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single();

  if (account) {
    const newBalance =
      type === "income"
        ? account.balance + amount
        : account.balance - amount;

    await supabase
      .from("accounts")
      .update({ balance: newBalance })
      .eq("id", accountId);
  }

  revalidatePath("/");
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  redirect("/transactions");
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();

  // Get original transaction to reverse balance
  const { data: original } = await supabase
    .from("transactions")
    .select("*, accounts(balance)")
    .eq("id", id)
    .single();

  if (!original) return { error: "Transacción no encontrada" };

  const accountId = formData.get("account_id") as string;
  const categoryId = formData.get("category_id") as string | null;
  const creditCardId = formData.get("credit_card_id") as string | null;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const description = (formData.get("description") as string) || null;

  // Update transaction
  const { error: txError } = await supabase
    .from("transactions")
    .update({
      account_id: accountId,
      category_id: categoryId || null,
      credit_card_id: creditCardId || null,
      type,
      amount,
      date,
      description,
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
  if (accountId !== original.account_id) {
    const { data: newAccount } = await supabase
      .from("accounts")
      .select("balance")
      .eq("id", accountId)
      .single();

    if (newAccount) {
      const updatedNewBalance =
        type === "income"
          ? newAccount.balance + amount
          : newAccount.balance - amount;

      await supabase
        .from("accounts")
        .update({ balance: updatedNewBalance })
        .eq("id", accountId);

      // Re-reverse the old account since we applied to new one
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
  const supabase = await createClient();

  // Get transaction to reverse balance
  const { data: transaction } = await supabase
    .from("transactions")
    .select("*, accounts(balance)")
    .eq("id", id)
    .single();

  if (!transaction) return { error: "Transacción no encontrada" };

  // Delete transaction
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { error: error.message };

  // Reverse balance impact
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
