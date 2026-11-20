import type { MonthlyReportDay } from "../../types";
import { Card } from "../ui/Card";
import { formatDayOfWeek } from "../../utils/date";
import { buildTimesheet } from "../../utils/timesheet";

const hours = (value: number) => (value ? `${value.toFixed(1)}h` : "–");

export function Timesheet({ days }: { days: MonthlyReportDay[] }) {
  const { projects, rows, totals, total } = buildTimesheet(days);

  return (
    <Card className="p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-secondary">
            <th className="py-2 pr-4 font-medium">Dia</th>
            {projects.map((project) => (
              <th key={project.id} className="py-2 px-3 font-medium text-right whitespace-nowrap">
                {project.name}
              </th>
            ))}
            <th className="py-2 pl-3 font-medium text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date} className="border-t border-primary-100">
              <td className="py-2 pr-4 text-text-secondary whitespace-nowrap capitalize">
                {formatDayOfWeek(row.date)} {row.date.slice(8, 10)}/{row.date.slice(5, 7)}
              </td>
              {row.cells.map((value, index) => (
                <td key={projects[index].id} className="py-2 px-3 text-right text-text-primary">
                  {hours(value)}
                </td>
              ))}
              <td className="py-2 pl-3 text-right font-medium text-text-primary">{hours(row.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-primary-200 text-text-primary font-medium">
            <td className="py-2 pr-4">Total</td>
            {totals.map((value, index) => (
              <td key={projects[index].id} className="py-2 px-3 text-right">
                {hours(value)}
              </td>
            ))}
            <td className="py-2 pl-3 text-right">{hours(total)}</td>
          </tr>
        </tfoot>
      </table>
    </Card>
  );
}
