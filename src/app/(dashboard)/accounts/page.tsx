import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { NewAccountForm } from "@/components/accounts/NewAccountForm";

export default async function AccountsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: true });

  const totalBalance = (accounts ?? []).reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Cuentas</h1>
      </div>

      {/* Balance total */}
      <Card className="bg-zinc-900 text-white border-zinc-800">
        <p className="text-sm text-zinc-400">Balance total</p>
        <p className="text-3xl font-bold mt-1">
          {formatCurrency(totalBalance, accounts?.[0]?.currency ?? "CRC")}
        </p>
      </Card>

      {/* Lista de cuentas */}
      <div className="grid gap-3 sm:grid-cols-2">
        {(accounts ?? []).map((account) => (
          <Link key={account.id} href={`/accounts/${account.id}`}>
            <Card className="hover:border-zinc-300 transition cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {account.name}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {account.currency}
                  </p>
                </div>
                <p
                  className={`text-lg font-bold ${
                    account.balance >= 0 ? "text-zinc-900" : "text-red-600"
                  }`}
                >
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Nueva cuenta */}
      <Card>
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">
          Agregar cuenta
        </h3>
        <NewAccountForm />
      </Card>
    </div>
  );
}
