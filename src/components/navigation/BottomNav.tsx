"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavItems = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M3 10l7-7 7 7M5 8.5V16a1 1 0 001 1h3v-4h2v4h3a1 1 0 001-1V8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/transactions",
    label: "Movimientos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <path d="M4 7h12M4 13h12M7 4l-3 3 3 3M13 10l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/accounts",
    label: "Cuentas",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M3 9h14" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: "/budgets",
    label: "Presupuestos",
    icon: (
      <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const moreNavItems = [
  {
    href: "/categories",
    label: "Categorías",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5h4v4H3zM3 11h4v4H3zM9 5h8M9 8h5M9 11h8M9 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: "/credit-cards",
    label: "Tarjetas de crédito",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 8h16M6 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/reports",
    label: "Reportes",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 15V9M10 15V5M15 15v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreNavItems.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* "Más" menu */}
      {moreOpen && (
        <div className="fixed bottom-16 right-2 z-50 mb-1 w-56 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1 shadow-lg md:hidden pb-[env(safe-area-inset-bottom)]">
          {moreNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition active:bg-zinc-100 dark:active:bg-zinc-800 ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-100 font-medium bg-zinc-50 dark:bg-zinc-800"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 md:hidden pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition active:scale-95 ${
                  isActive
                    ? "text-zinc-900 dark:text-zinc-100 font-medium"
                    : "text-zinc-400 active:text-zinc-600 dark:active:text-zinc-300"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          {/* Más */}
          <button
            onClick={() => setMoreOpen((prev) => !prev)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition active:scale-95 ${
              isMoreActive || moreOpen
                ? "text-zinc-900 dark:text-zinc-100 font-medium"
                : "text-zinc-400 active:text-zinc-600 dark:active:text-zinc-300"
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <circle cx="4" cy="10" r="1.5" fill="currentColor" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
              <circle cx="16" cy="10" r="1.5" fill="currentColor" />
            </svg>
            Más
          </button>
        </div>
      </nav>
    </>
  );
}
