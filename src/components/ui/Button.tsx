import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-50",
  secondary:
    "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50",
  ghost:
    "text-zinc-700 hover:bg-zinc-100 disabled:opacity-50",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
