// Raw operation data, exactly as it comes from the Excel file uploaded by the operator
// This is the "input contract": every column the spreadsheet must contain
export type RawOperation = {
  client: string;
  asset: string;
  entryDate: string;       //  DD/MM/YYYY
  fixingDate: string;      //  DD/MM/YYYY 
  entryPrice: number;
  currentPrice: number;
  notional: number;
  grossCoupon: number;     // percentage (11.5 = 11.5%)
  downBarrier: number;     // percentage value, e.g. 88 means 88% of entry price
  barrierBreached: boolean; // true = asset fell below the barrier, client keeps the asset
};

// The two possible outcomes of a SOC operation, decided by the calculation engine
export type OperationStatus = "Coupon Received" | "Holding Asset";

// A fully calculated operation: raw data plus every derived result
export type CalculatedOperation = RawOperation & {
  status: OperationStatus;
  grossResultPct: number;        // e.g. 0.115 means 11.5%
  netResultPct: number;
  financialResult: number;       // in BRL
  appliedCostPct: number;        // either 0.0101 (full) or 0.00505 (entry only)
  allocationMonth: string;       // format "2026-07" (year-month), used for grouping
};

// Aggregated totals for either a client or a month.
// The same shape is reused for both groupings — see consolidation.ts in utils/
export type ConsolidatedSummary = {
  key: string;                     // client name, or a month like "2026-07"
  operationCount: number;
  totalFinancialResult: number;
  totalNotional: number;
  averageResultPct: number;        // totalFinancialResult / totalNotional
};