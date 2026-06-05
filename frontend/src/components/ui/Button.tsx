import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-300",
  secondary:
    "bg-white text-text-primary border border-primary-200 hover:border-primary-300 focus:ring-primary-200",
  danger:
    "bg-error text-white hover:opacity-90 focus:ring-error/50",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
