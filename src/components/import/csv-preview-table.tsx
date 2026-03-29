/**
 * CSV Preview Table — editable HTML table for parsed CSV rows.
 *
 * Built as a plain HTML table + inputs. If future requirements demand sorting,
 * filtering, pagination, or large datasets, consider:
 * - AG Grid (enterprise, feature-rich)
 * - TanStack Table (headless, lightweight, open source)
 */

import type { CsvSystemRow } from '@/lib/import';
import type { SystemType, StandardFunction } from '@/lib/types';

export interface CsvPreviewTableProps {
  rows: CsvSystemRow[];
  onChange: (rows: CsvSystemRow[]) => void;
}

const SYSTEM_TYPES: { value: SystemType; label: string }[] = [
  { value: 'crm', label: 'CRM' },
  { value: 'finance', label: 'Finance' },
  { value: 'hr', label: 'HR' },
  { value: 'case_management', label: 'Case Management' },
  { value: 'website', label: 'Website' },
  { value: 'email', label: 'Email' },
  { value: 'document_management', label: 'Document Management' },
  { value: 'database', label: 'Database' },
  { value: 'spreadsheet', label: 'Spreadsheet' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'custom', label: 'Custom' },
  { value: 'other', label: 'Other' },
];

const STANDARD_FUNCTIONS: { value: StandardFunction; label: string }[] = [
  { value: 'finance', label: 'Finance' },
  { value: 'governance', label: 'Governance' },
  { value: 'people', label: 'People' },
  { value: 'fundraising', label: 'Fundraising' },
  { value: 'communications', label: 'Communications' },
  { value: 'service_delivery', label: 'Service Delivery' },
  { value: 'operations', label: 'Operations' },
  { value: 'data_reporting', label: 'Data & Reporting' },
];

function cellBg(value: string | number | undefined | null): string {
  if (value !== undefined && value !== null && value !== '') {
    return 'bg-green-50';
  }
  return 'bg-amber-50';
}

function updateRow(
  rows: CsvSystemRow[],
  index: number,
  patch: Partial<CsvSystemRow>,
): CsvSystemRow[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

export function CsvPreviewTable({ rows, onChange }: CsvPreviewTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="px-3 py-2 text-left font-medium text-gray-700">
              Name
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">
              Vendor
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">
              Type
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">
              Cost
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700">
              Function
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-gray-200">
              {/* Name */}
              <td
                data-row={index}
                data-col="name"
                className={`px-1 py-1 ${cellBg(row.name)}`}
              >
                <label className="sr-only" htmlFor={`name-${index}`}>
                  Name for row {index + 1}
                </label>
                <input
                  id={`name-${index}`}
                  type="text"
                  required
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={row.name}
                  onChange={(e) =>
                    onChange(
                      updateRow(rows, index, { name: e.target.value }),
                    )
                  }
                />
              </td>

              {/* Vendor */}
              <td
                data-row={index}
                data-col="vendor"
                className={`px-1 py-1 ${cellBg(row.vendor)}`}
              >
                <label className="sr-only" htmlFor={`vendor-${index}`}>
                  Vendor for row {index + 1}
                </label>
                <input
                  id={`vendor-${index}`}
                  type="text"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={row.vendor ?? ''}
                  onChange={(e) =>
                    onChange(
                      updateRow(rows, index, {
                        vendor: e.target.value || undefined,
                      }),
                    )
                  }
                />
              </td>

              {/* Type */}
              <td
                data-row={index}
                data-col="type"
                className={`px-1 py-1 ${cellBg(row.matchedType)}`}
              >
                <label className="sr-only" htmlFor={`type-${index}`}>
                  Type for row {index + 1}
                </label>
                <select
                  id={`type-${index}`}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={row.matchedType}
                  onChange={(e) =>
                    onChange(
                      updateRow(rows, index, {
                        matchedType: e.target.value as SystemType,
                      }),
                    )
                  }
                >
                  {SYSTEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </td>

              {/* Cost */}
              <td
                data-row={index}
                data-col="cost"
                className={`px-1 py-1 ${cellBg(row.cost)}`}
              >
                <label className="sr-only" htmlFor={`cost-${index}`}>
                  Cost for row {index + 1}
                </label>
                <input
                  id={`cost-${index}`}
                  type="number"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={row.cost ?? ''}
                  onChange={(e) =>
                    onChange(
                      updateRow(rows, index, {
                        cost: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }),
                    )
                  }
                />
              </td>

              {/* Function */}
              <td
                data-row={index}
                data-col="function"
                className={`px-1 py-1 ${cellBg(row.matchedFunction)}`}
              >
                <label className="sr-only" htmlFor={`function-${index}`}>
                  Function for row {index + 1}
                </label>
                <select
                  id={`function-${index}`}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={row.matchedFunction ?? ''}
                  onChange={(e) =>
                    onChange(
                      updateRow(rows, index, {
                        matchedFunction:
                          (e.target.value as StandardFunction) || undefined,
                      }),
                    )
                  }
                >
                  <option value="">-- Select --</option>
                  {STANDARD_FUNCTIONS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
