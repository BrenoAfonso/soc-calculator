type Props = {
  title: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
};

export function SummaryCard({ title, value, tone = "neutral" }: Props) {
  return (
    <div className={`summary-card summary-${tone}`}>
      <p className="summary-title">{title}</p>
      <p className="summary-value">{value}</p>
    </div>
  );
}