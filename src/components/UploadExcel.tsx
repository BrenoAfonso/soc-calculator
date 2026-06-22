import { useRef, useState } from "react";
import { readOperationsFromExcel } from "../utils/excelReader";
import type { RawOperation } from "../types/operation";

type Props = {
  onLoad: (operations: RawOperation[]) => void;
};

export function UploadExcel({ onLoad }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    setError("");
    setLoading(true);
    try {
      const operations = await readOperationsFromExcel(file);
      if (operations.length === 0) {
        setError("No recognizable operation rows found in this file.");
        setLoading(false);
        return;
      }
      setFileName(file.name);
      onLoad(operations);
    } catch {
      setError("Could not read this file. Make sure it's a valid .xlsx.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="upload-container">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <button className="upload-button" onClick={() => inputRef.current?.click()}>
        {loading ? "Reading file..." : "Select operations Excel file"}
      </button>
      {fileName && !error && <p className="upload-success">Loaded: {fileName}</p>}
      {error && <p className="upload-error">{error}</p>}
    </div>
  );
}