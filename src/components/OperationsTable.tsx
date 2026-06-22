import type { CalculatedOperation } from "../types/operation";

type Props = {
  operations: CalculatedOperation[];
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPct(value: number): string {
  return (value * 100).toFixed(2) + "%";
}

export function OperationsTable({ operations }: Props) {
  return (
    <div className="table-container">
      <h3>Operation detail</h3>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Asset</th>
            <th>Status</th>
            <th>Month</th>
            <th>Gross</th>
            <th>Net</th>
            <th>Financial</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op, index) => (
            <tr key={index}>
              <td>{op.client}</td>
              <td>{op.asset}</td>
              <td>
                <span className={op.status === "Holding Asset" ? "tag-holding" : "tag-coupon"}>
                  {op.status}
                </span>
              </td>
              <td>{op.allocationMonth}</td>
              <td>{formatPct(op.grossResultPct)}</td>
              <td className={op.netResultPct < 0 ? "value-negative" : "value-positive"}>
                {formatPct(op.netResultPct)}
              </td>
              <td className={op.financialResult < 0 ? "value-negative" : "value-positive"}>
                {formatCurrency(op.financialResult)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}