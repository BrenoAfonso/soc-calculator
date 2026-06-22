import type { RawOperation, CalculatedOperation } from "../types/operation";

// Operational cost split: half charged on entry, half on exit (settlement).
export const ENTRY_COST_PCT = 0.00505;
export const EXIT_COST_PCT = 0.00505;
export const FULL_COST_PCT = ENTRY_COST_PCT + EXIT_COST_PCT;

export function parseBrDate(dateText: string): Date {
  const parts = dateText.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month - 1, day);
}

export function monthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function calculateOperation(
  op: RawOperation,
  calculationMonth: Date
): CalculatedOperation {
  if (!op.barrierBreached) {
    // Coupon received: asset is sold, full cost applies (entry + exit).
    // Allocated to the fixing month, since that's when the position settled.
    const grossResultPct = op.grossCoupon / 100;
    const netResultPct = grossResultPct - FULL_COST_PCT;
    const financialResult = op.notional * netResultPct;
    const fixingDate = parseBrDate(op.fixingDate);

    return {
      ...op,
      status: "Coupon Received",
      grossResultPct,
      netResultPct,
      financialResult,
      appliedCostPct: FULL_COST_PCT,
      allocationMonth: monthKey(fixingDate),
    };
  } else {
    // Holding asset: position not settled yet, only entry cost applies.
    // Allocated to the calculation month, since it's marked to market each upload.
    const grossResultPct = op.currentPrice / op.entryPrice - 1;
    const netResultPct = grossResultPct - ENTRY_COST_PCT;
    const financialResult = op.notional * netResultPct;

    return {
      ...op,
      status: "Holding Asset",
      grossResultPct,
      netResultPct,
      financialResult,
      appliedCostPct: ENTRY_COST_PCT,
      allocationMonth: monthKey(calculationMonth),
    };
  }
}

export function calculateOperations(
  operations: RawOperation[],
  calculationMonth: Date = new Date()
): CalculatedOperation[] {
  return operations.map((op) => calculateOperation(op, calculationMonth));
}