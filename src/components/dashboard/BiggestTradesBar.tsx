interface BiggestTradesBarProps {
  winAmount: number;
  lossAmount: number;
}

export function BiggestTradesBar({ winAmount, lossAmount }: BiggestTradesBarProps) {
  const maxValue = Math.max(winAmount, Math.abs(lossAmount));
  const winWidth = maxValue > 0 ? (winAmount / maxValue) * 100 : 0;
  const lossWidth = maxValue > 0 ? (Math.abs(lossAmount) / maxValue) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-success">↑ Win:</span>
        <span className="text-xs font-medium text-success">${winAmount.toFixed(0)}</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-success rounded-full transition-all duration-500" 
          style={{ width: `${winWidth}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-danger">↓ Loss:</span>
        <span className="text-xs font-medium text-danger">${Math.abs(lossAmount).toFixed(0)}</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-danger rounded-full transition-all duration-500" 
          style={{ width: `${lossWidth}%` }}
        />
      </div>
    </div>
  );
}
