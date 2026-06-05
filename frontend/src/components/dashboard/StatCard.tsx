interface StatCardProps {
  title: string;
  hours: number;
  bgColor: string;
  borderColor: string;
}

export function StatCard({ title, hours, bgColor, borderColor }: StatCardProps) {
  return (
    <div
      className={`rounded-xl p-4 ${bgColor}`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <p className="text-sm text-text-secondary">{title}</p>
      <p className="text-2xl font-semibold text-text-primary mt-1">
        {hours.toFixed(1)}h
      </p>
    </div>
  );
}
