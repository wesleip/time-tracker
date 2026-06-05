import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, className = "", ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
      <input
        id={inputId}
        className={`rounded-lg border border-primary-100 bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${className}`}
        {...props}
      />
    </div>
  );
}
