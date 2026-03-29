export function formatCurrency(amount: number, currency: string = "CRC"): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "CRC" ? 0 : 2,
    maximumFractionDigits: currency === "CRC" ? 0 : 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

export function getMonthRange(date: Date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

export function getCreditCardPeriod(cutOffDay: number, referenceDate: Date = new Date()) {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const day = referenceDate.getDate();

  let periodStart: Date;
  let periodEnd: Date;

  if (day <= cutOffDay) {
    periodStart = new Date(year, month - 1, cutOffDay + 1);
    periodEnd = new Date(year, month, cutOffDay);
  } else {
    periodStart = new Date(year, month, cutOffDay + 1);
    periodEnd = new Date(year, month + 1, cutOffDay);
  }

  return {
    start: periodStart.toISOString().split("T")[0],
    end: periodEnd.toISOString().split("T")[0],
  };
}

export function getMonthName(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("es-CR", { month: "long" }).format(date);
}

export function toDateInputValue(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}
