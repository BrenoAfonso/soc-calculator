import * as XLSX from "xlsx";
import type { RawOperation } from "../types/operation";

function toBoolean(value: unknown): boolean {
  const text = String(value).trim().toLowerCase();
  return text === "yes" || text === "true" || text === "1";
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const text = String(value).trim().replace(",", ".");
  const num = parseFloat(text);
  return isNaN(num) ? 0 : num;
}

export function readOperationsFromExcel(file: File): Promise<RawOperation[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          raw: false,
        });

        const operations: RawOperation[] = rows.map((row) => ({
          client: String(row["Client"] ?? "").trim(),
          asset: String(row["Asset"] ?? "").trim(),
          entryDate: String(row["Entry Date"] ?? "").trim(),
          fixingDate: String(row["Fixing Date"] ?? "").trim(),
          entryPrice: toNumber(row["Entry Price"]),
          currentPrice: toNumber(row["Current Price"]),
          notional: toNumber(row["Notional"]),
          grossCoupon: toNumber(row["Gross Coupon (%)"]),
          downBarrier: toNumber(row["Down Barrier (%)"]),
          barrierBreached: toBoolean(row["Barrier Breached"]),
        }));

        resolve(operations);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file"));
    reader.readAsBinaryString(file);
  });
}