interface BadgeProps {
  color: string;
  children: string;
}

export function Badge({ color, children }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}
