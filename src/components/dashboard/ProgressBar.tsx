interface ProgressBarProps {
  leftValue: number;
  rightValue: number;
  leftLabel?: string;
  rightLabel?: string;
}

export function ProgressBar({ leftValue, rightValue, leftLabel, rightLabel }: ProgressBarProps) {
  const total = Math.abs(leftValue) + Math.abs(rightValue);
  const leftPercent = total > 0 ? (Math.abs(leftValue) / total) * 100 : 50;

  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden bg-secondary">
        <div 
          className="bg-success transition-all duration-500" 
          style={{ width: `${leftPercent}%` }} 
        />
        <div 
          className="bg-danger transition-all duration-500" 
          style={{ width: `${100 - leftPercent}%` }} 
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-success">{leftLabel || `$${leftValue.toFixed(0)}`}</span>
        <span className="text-xs text-danger">{rightLabel || `$${Math.abs(rightValue).toFixed(0)}`}</span>
      </div>
    </div>
  );
}
