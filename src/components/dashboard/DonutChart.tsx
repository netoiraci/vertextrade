interface DonutChartProps {
  wins: number;
  losses: number;
  size?: number;
}

export function DonutChart({ wins, losses, size = 60 }: DonutChartProps) {
  const total = wins + losses;
  const winPercent = total > 0 ? (wins / total) * 100 : 0;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const winOffset = circumference - (winPercent / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle (losses) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--danger))"
          strokeWidth={strokeWidth}
        />
        {/* Foreground circle (wins) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--success))"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={winOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-xs font-medium text-success">{wins}</span>
          <span className="text-xs text-muted-foreground mx-0.5">/</span>
          <span className="text-xs font-medium text-danger">{losses}</span>
        </div>
      </div>
    </div>
  );
}
