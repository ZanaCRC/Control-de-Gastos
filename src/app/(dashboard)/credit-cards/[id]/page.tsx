import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDateShort, getCreditCardPeriod, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { BackButton } from "@/components/ui/BackButton";
import { CreditCardItem } from "@/components/credit-cards/CreditCardItem";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CreditCardDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: card } = await supabase
    .from("credit_cards")
    .select("*")
    .eq("id", id)
    .single();

  if (!card) notFound();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, currency")
    .eq("user_id", user!.id);

  const defaultCurrency = accounts?.[0]?.currency ?? "CRC";
  const accountIds = (accounts ?? []).map((a) => a.id);

  const { start, end } = getCreditCardPeriod(card.cut_off_day);

  const { data: transactions } = accountIds.length
    ? await supabase
        .from("transactions")
        .select("*, categories(name, color)")
        .eq("credit_card_id", id)
        .in("account_id", accountIds)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: false })
    : { data: [] };

  const txList = transactions ?? [];
  const totalPeriod = txList.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton href="/credit-cards" />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 truncate">{card.name}</h1>
          <p className="text-sm text-zinc-500">
            Corte: día {card.cut_off_day} &middot; Pago: día {card.payment_due_day}
          </p>
        </div>
        <CreditCardItem id={card.id} name={card.name} />
      </div>

      {/* Period info */}
      <Card className="bg-zinc-900 text-white border-zinc-800">
        <p className="text-sm text-zinc-400">Total período actual</p>
        <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">
          {formatCurrency(totalPeriod, defaultCurrency)}
        </p>
        <p className="text-xs text-zinc-500 mt-2">
          {formatDate(start)} — {formatDate(end)}
        </p>
      </Card>

      {/* Transactions */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
          Transacciones del período
        </h3>
        {txList.length === 0 ? (
          <p className="text-sm text-zinc-400 py-8 text-center">
            Sin transacciones en este período.
          </p>
        ) : (
          <Card className="divide-y divide-zinc-100 p-0">
            {txList.map((t) => {
              const cat = t.categories as { name: string; color: string } | null;
              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                      style={{
                        backgroundColor: `${cat?.color ?? "#71717a"}18`,
                        color: cat?.color ?? "#71717a",
                      }}
                    >
                      {(cat?.name ?? "?")[0]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">
                        {t.description || cat?.name || "Transacción"}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {formatDateShort(t.date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(t.amount, defaultCurrency)}
                  </span>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </div>
  );
}
