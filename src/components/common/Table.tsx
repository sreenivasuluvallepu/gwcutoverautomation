import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
}

export default function Table<T>({ columns, rows }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-ink-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-ink-100/80 dark:bg-ink-800/80">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-600 dark:text-ink-200">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-ink-200 bg-white/80 dark:border-ink-800 dark:bg-ink-900/70">
              {columns.map((column) => (
                <td key={`${column.key}-${index}`} className="px-3 py-2.5 text-ink-800 dark:text-ink-100">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
