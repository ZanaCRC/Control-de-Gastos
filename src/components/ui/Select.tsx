import { type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  id,
  options,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  const errorId = id ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-zinc-700 mb-1.5">
        {label}
      </label>
      <select
        id={id}
        aria-describedby={error && errorId ? errorId : undefined}
        aria-invalid={error ? "true" : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-hidden transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 ${
          error ? "border-red-300" : "border-zinc-300"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
