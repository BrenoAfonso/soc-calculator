import type { CalculatedOperation, ConsolidatedSummary } from "../types/operation";

function groupBy(
  operations: CalculatedOperation[],
  getKey: (op: CalculatedOperation) => string
): ConsolidatedSummary[] {
  const groups = new Map<string, CalculatedOperation[]>();

  for (const op of operations) {
    const key = getKey(op);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(op);
  }

  const result: ConsolidatedSummary[] = [];
  for (const [key, ops] of groups) {
    const totalFinancialResult = ops.reduce((sum, op) => sum + op.financialResult, 0);
    const totalNotional = ops.reduce((sum, op) => sum + op.notional, 0);
    const averageResultPct = totalNotional !== 0 ? totalFinancialResult / totalNotional : 0;

    result.push({
      key,
      operationCount: ops.length,
      totalFinancialResult,
      totalNotional,
      averageResultPct,
    });
  }

  return result;
}

export function consolidateByClient(
  operations: CalculatedOperation[]
): ConsolidatedSummary[] {
  return groupBy(operations, (op) => op.client).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}

export function consolidateByMonth(
  operations: CalculatedOperation[]
): ConsolidatedSummary[] {
  return groupBy(operations, (op) => op.allocationMonth).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}