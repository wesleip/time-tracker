import type { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({ children, hover = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-bg-secondary border border-primary-100 rounded-xl ${
        hover ? "transition-all duration-200 hover:border-primary-300 hover:shadow-sm" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
