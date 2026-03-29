import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={error && errorId ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-hidden transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 ${
          error ? "border-red-300" : "border-zinc-300"
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
