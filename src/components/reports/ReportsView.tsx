"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  categories: { id: string; name: string; color: string | null } | null;
}

interface Props {
  transactions: Transaction[];
  currency: string;
}

export function ReportsView({ transactions, currency }: Props) {
  // Monthly income vs expenses
  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; ingresos: number; gastos: number }> = {};

    transactions.forEach((t) => {
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      const monthLabel = new Date(t.date + "T12:00:00").toLocaleDateString("es-CR", {
        month: "short",
      });

      if (!months[monthKey]) {
        months[monthKey] = { month: monthLabel, ingresos: 0, gastos: 0 };
      }

      if (t.type === "income") {
        months[monthKey].ingresos += t.amount;
      } else {
        months[monthKey].gastos += t.amount;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [transactions]);

  // Category breakdown (expenses only, current month)
  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const cats: Record<string, { name: string; value: number; color: string }> = {};

    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .forEach((t) => {
        const name = t.categories?.name ?? "Sin categoría";
        const color = t.categories?.color ?? "#71717a";
        if (!cats[name]) {
          cats[name] = { name, value: 0, color };
        }
        cats[name].value += t.amount;
      });

    return Object.values(cats).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Daily spending trend (current month)
  const dailyTrend = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const days: Record<string, number> = {};

    transactions
      .filter((t) => t.type === "expense" && t.date.startsWith(currentMonth))
      .forEach((t) => {
        const day = parseInt(t.date.split("-")[2]);
        days[day] = (days[day] || 0) + t.amount;
      });

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return Array.from({ length: Math.min(now.getDate(), daysInMonth) }, (_, i) => ({
      day: i + 1,
      gasto: days[i + 1] || 0,
    }));
  }, [transactions]);

  // Top categories
  const topCategories = categoryData.slice(0, 5);
  const totalExpenses = categoryData.reduce((s, c) => s + c.value, 0);

  if (transactions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-zinc-400 text-center py-8">
          No hay datos suficientes para generar reportes. Registra algunas
          transacciones primero.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly income vs expenses */}
      <Card>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Ingresos vs Gastos por mes
        </h3>
        <div className="h-56 sm:h-64 -ml-2 sm:ml-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
              <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" width={50} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e4e4e7",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category pie chart */}
        <Card>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Distribución por categoría (mes actual)
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">
              Sin gastos este mes.
            </p>
          ) : (
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={35}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(Number(value), currency)
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e4e4e7",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Top categories ranking */}
        <Card>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Top categorías
          </h3>
          {topCategories.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">
              Sin datos.
            </p>
          ) : (
            <div className="space-y-3">
              {topCategories.map((cat, i) => {
                const pct =
                  totalExpenses > 0
                    ? Math.round((cat.value / totalExpenses) * 100)
                    : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 w-4">
                          {i + 1}.
                        </span>
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-zinc-700 dark:text-zinc-300">{cat.name}</span>
                      </div>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(cat.value, currency)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 ml-6">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Daily spending trend */}
      <Card>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Tendencia de gastos diarios (mes actual)
        </h3>
        {dailyTrend.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">
            Sin datos.
          </p>
        ) : (
          <div className="h-44 sm:h-48 -ml-2 sm:ml-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 10 }} stroke="#a1a1aa" width={50} />
                <Tooltip
                  formatter={(value) =>
                    formatCurrency(Number(value), currency)
                  }
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e4e4e7",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="gasto"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}
