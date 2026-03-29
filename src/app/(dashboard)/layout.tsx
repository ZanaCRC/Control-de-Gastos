import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/navigation/Sidebar";
import { BottomNav } from "@/components/navigation/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";
import { logout } from "@/app/login/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check if user has accounts (for onboarding redirect)
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", user.id)
    .limit(1);

  if (!accounts || accounts.length === 0) {
    redirect("/onboarding");
  }

  const displayName =
    user.user_metadata?.full_name || user.email || "Usuario";

  return (
    <ToastProvider>
      <div className="flex h-screen bg-zinc-50">
        <Sidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:h-16 md:px-6">
            <span className="text-lg font-bold text-zinc-900 md:hidden">
              Control de Gastos
            </span>
            <div className="hidden md:block">
              {/* Spacer for desktop since sidebar has the title */}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 hidden sm:inline">
                {displayName}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition"
                >
                  Salir
                </button>
              </form>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
              {children}
            </div>
          </main>
        </div>

        <BottomNav />
      </div>
    </ToastProvider>
  );
}
