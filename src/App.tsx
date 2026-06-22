import { useMemo, useState } from "react";
import { UploadExcel } from "./components/UploadExcel";
import { SummaryCard } from "./components/SummaryCard";
import { ConsolidatedTable } from "./components/ConsolidatedTable";
import { OperationsTable } from "./components/OperationsTable";
import { calculateOperations } from "./utils/calculation";
import { consolidateByClient, consolidateByMonth } from "./utils/consolidation";
import type { RawOperation } from "./types/operation";
import "./theme.css";
import "./App.css";

function App() {
  const [rawOperations, setRawOperations] = useState<RawOperation[]>([]);

  const calculatedOperations = useMemo(
    () => calculateOperations(rawOperations, new Date()),
    [rawOperations]
  );

  const byClient = useMemo(
    () => consolidateByClient(calculatedOperations),
    [calculatedOperations]
  );

  const byMonth = useMemo(
    () => consolidateByMonth(calculatedOperations),
    [calculatedOperations]
  );

  const totalFinancialResult = useMemo(
    () => calculatedOperations.reduce((sum, op) => sum + op.financialResult, 0),
    [calculatedOperations]
  );

  const totalNotional = useMemo(
    () => calculatedOperations.reduce((sum, op) => sum + op.notional, 0),
    [calculatedOperations]
  );

  const overallPct = totalNotional !== 0 ? totalFinancialResult / totalNotional : 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SOC Operations Calculator</h1>
        <p className="app-subtitle">Sacre Investimentos</p>
      </header>

      <UploadExcel onLoad={setRawOperations} />

      {calculatedOperations.length > 0 && (
        <>
          <section className="summary-cards">
            <SummaryCard title="Operations loaded" value={String(calculatedOperations.length)} />
            <SummaryCard
              title="Total notional"
              value={totalNotional.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            />
            <SummaryCard
              title="Total financial result"
              value={totalFinancialResult.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              tone={totalFinancialResult >= 0 ? "positive" : "negative"}
            />
            <SummaryCard
              title="Overall result %"
              value={(overallPct * 100).toFixed(2) + "%"}
              tone={overallPct >= 0 ? "positive" : "negative"}
            />
          </section>

          <ConsolidatedTable title="Consolidated by client" keyLabel="Client" data={byClient} />
          <ConsolidatedTable title="Consolidated by month" keyLabel="Month" data={byMonth} />
          <OperationsTable operations={calculatedOperations} />
        </>
      )}
    </div>
  );
}

export default App;