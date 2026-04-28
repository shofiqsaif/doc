type Column = {
  key: string;
  header: string;
  render?: (value: unknown, row: unknown) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: unknown[];
  actions?: (row: unknown) => React.ReactNode;
}

export default function DataTable({ columns, data, actions }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3">
                {col.header}
              </th>
            ))}
            {actions && <th className="px-6 py-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-6 py-8 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const record = row as Record<string, unknown>;
              return (
                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4">
                      {col.render
                        ? col.render(record[col.key], row)
                        : String(record[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">{actions(row)}</div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
