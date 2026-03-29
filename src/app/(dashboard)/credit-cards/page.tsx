import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { CreditCardItem } from "@/components/credit-cards/CreditCardItem";
import { formatCurrency, getCreditCardPeriod } from "@/lib/utils";
import Link from "next/link";

export default async function CreditCardsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: creditCards } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("user_id", user!.id)
    .order("name", { ascending: true });

  // Get accounts for currency
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, currency")
    .eq("user_id", user!.id);

  const defaultCurrency = accounts?.[0]?.currency ?? "CRC";
  const accountIds = (accounts ?? []).map((a) => a.id);

  // Get current period totals for each card (parallel)
  const cardTotalEntries = await Promise.all(
    (creditCards ?? []).map(async (card) => {
      const { start, end } = getCreditCardPeriod(card.cut_off_day);
      const { data: txs } = accountIds.length
        ? await supabase
            .from("transactions")
            .select("amount")
            .eq("credit_card_id", card.id)
            .in("account_id", accountIds)
            .gte("date", start)
            .lte("date", end)
        : { data: [] };
      return [card.id, (txs ?? []).reduce((s, t) => s + t.amount, 0)] as const;
    })
  );
  const cardTotals = Object.fromEntries(cardTotalEntries);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900">Tarjetas de crédito</h1>

      {(creditCards ?? []).length === 0 ? (
        <EmptyState
          title="Sin tarjetas"
          description="Agrega tus tarjetas de crédito para llevar control de los pagos."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(creditCards ?? []).map((card) => (
            <Link key={card.id} href={`/credit-cards/${card.id}`}>
              <Card className="hover:border-zinc-300 active:bg-zinc-50 transition cursor-pointer">
                <p className="text-sm font-medium text-zinc-900">{card.name}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Corte: día {card.cut_off_day} &middot; Pago: día{" "}
                  {card.payment_due_day}
                </p>
                <p className="text-lg font-bold text-zinc-900 mt-2">
                  {formatCurrency(cardTotals[card.id] ?? 0, defaultCurrency)}
                </p>
                <p className="text-xs text-zinc-400">Período actual</p>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Form para agregar */}
      <Card>
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">
          Agregar tarjeta
        </h3>
        <CreditCardForm />
      </Card>
    </div>
  );
}
