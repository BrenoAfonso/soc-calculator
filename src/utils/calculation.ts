import type { RawOperation, CalculatedOperation } from "../types/operation";

// Operational cost split: half charged on entry, half on exit (settlement).
export const ENTRY_COST_PCT = 0.00505;
export const EXIT_COST_PCT = 0.00505;
export const FULL_COST_PCT = ENTRY_COST_PCT + EXIT_COST_PCT;

// Handles two possible formats coming from Excel:
// - plain text cells: "15/02/2026"
// - native Excel date cells: "2026-02-15 0:00:00"
export function parseBrDate(dateText: string): Date {
  const trimmed = dateText.trim();

  if (trimmed.includes("-")) {
    const [datePart] = trimmed.split(" ");
    const [year, month, day] = datePart.split("-").map((p) => parseInt(p, 10));
    return new Date(year, month - 1, day);
  }

  const [day, month, year] = trimmed.split("/").map((p) => parseInt(p, 10));
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
  const entryNotional = op.quantity * op.entryPrice;

  if (!op.barrierBreached) {
    // Coupon received: asset is sold, full cost applies (entry + exit).
    // Allocated to the fixing month (position settled).
    const grossResultPct = op.grossCoupon / 100;
    const netResultPct = grossResultPct - FULL_COST_PCT;
    const financialResult = entryNotional * netResultPct;
    const fixingDate = parseBrDate(op.fixingDate);

    return {
      ...op,
      notional: entryNotional,
      status: "Coupon Received",
      grossResultPct,
      netResultPct,
      financialResult,
      appliedCostPct: FULL_COST_PCT,
      allocationMonth: monthKey(fixingDate),
    };
  } else {
    // Holding asset: position not settled yet, only entry cost applies.
    // Result is based on the real share count.
    const currentValue = op.quantity * op.currentPrice;
    const grossResultPct = currentValue / entryNotional - 1;
    const netResultPct = grossResultPct - ENTRY_COST_PCT;
    const financialResult = currentValue - entryNotional - entryNotional * ENTRY_COST_PCT;

    return {
      ...op,
      notional: entryNotional,
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