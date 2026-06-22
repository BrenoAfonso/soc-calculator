import type { ConsolidatedSummary } from "../types/operation";

type Props = {
  title: string;
  keyLabel: string;
  data: ConsolidatedSummary[];
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

export function ConsolidatedTable({ title, keyLabel, data }: Props) {
  return (
    <div className="table-container">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>
            <th>{keyLabel}</th>
            <th>Operations</th>
            <th>Total notional</th>
            <th>Financial result</th>
            <th>Result %</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.key}>
              <td>{row.key}</td>
              <td>{row.operationCount}</td>
              <td>{formatCurrency(row.totalNotional)}</td>
              <td className={row.totalFinancialResult < 0 ? "value-negative" : "value-positive"}>
                {formatCurrency(row.totalFinancialResult)}
              </td>
              <td className={row.averageResultPct < 0 ? "value-negative" : "value-positive"}>
                {formatPct(row.averageResultPct)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}