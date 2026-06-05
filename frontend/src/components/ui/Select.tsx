import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, id, options, placeholder, className = "", ...props }: SelectProps) {
  const selectId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-text-secondary">
        {label}
      </label>
      <select
        id={selectId}
        className={`rounded-lg border border-primary-100 bg-white px-3 py-2 text-sm text-text-primary transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
