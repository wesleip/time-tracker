import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/dashboard/StatCard";
import { useDailyReport, useMonthlyReport, useWeeklyReport } from "../hooks/useEntries";

const today = () => new Date().toISOString().split("T")[0];
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export function Dashboard() {
  const todayStr = today();
  const monthStr = currentMonth();

  const { data: dailyReport } = useDailyReport(todayStr);
  const { data: weeklyReport } = useWeeklyReport(todayStr);
  const { data: monthlyReport } = useMonthlyReport(monthStr);

  const projectTotals = monthlyReport?.days
    .flatMap((d) => d.projects)
    .reduce<Record<string, { name: string; color: string; hours: number }>>((acc, p) => {
      if (!acc[p.projectId]) {
        acc[p.projectId] = { name: p.projectName, color: p.projectColor, hours: 0 };
      }
      acc[p.projectId].hours += p.totalHours;
      return acc;
    }, {});

  const sortedProjects = Object.values(projectTotals ?? {}).sort((a, b) => b.hours - a.hours);

  const recentDays = [...(monthlyReport?.days ?? [])]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <Layout title="Dashboard">
      <div className="p-4 md:p-6 space-y-8">

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Hoje"
            hours={dailyReport?.totalHours ?? 0}
            bgColor="bg-[#f3f7f5]"
            borderColor="#7fa391"
          />
          <StatCard
            title="Esta semana"
            hours={weeklyReport?.totalHours ?? 0}
            bgColor="bg-[#f5f7fa]"
            borderColor="#8294a5"
          />
          <StatCard
            title="Este mês"
            hours={monthlyReport?.totalHours ?? 0}
            bgColor="bg-[#faf6ef]"
            borderColor="#d2b97d"
          />
        </div>

        {/* Projects this month */}
        <section>
          <h2 className="text-sm font-medium text-text-secondary mb-3">Projetos este mês</h2>
          {sortedProjects.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-text-muted text-sm">Nenhum registro este mês.</p>
              <Link
                to="/registrar"
                className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Fazer primeiro registro →
              </Link>
            </Card>
          ) : (
            <Card className="divide-y divide-primary-100">
              {sortedProjects.map((p) => (
                <div key={p.name} className="flex items-center justify-between px-4 py-3">
                  <Badge color={p.color}>{p.name}</Badge>
                  <span className="text-sm font-medium text-text-primary">
                    {p.hours.toFixed(1)}h
                  </span>
                </div>
              ))}
            </Card>
          )}
        </section>

        {/* Recent days */}
        {recentDays.length > 0 && (
          <section>
            <h2 className="text-sm font-medium text-text-secondary mb-3">Últimos dias</h2>
            <div className="space-y-2">
              {recentDays.map((day) => (
                <Card key={day.date} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">
                      {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="text-sm font-semibold text-text-primary">
                      {day.totalHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {day.projects.map((p) => (
                      <Badge key={p.projectId} color={p.projectColor}>
                        {p.projectName}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}
