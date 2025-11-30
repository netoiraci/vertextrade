import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";

interface RecentTradesWidgetProps {
  trades: Trade[];
}

export function RecentTradesWidget({ trades }: RecentTradesWidgetProps) {
  const recentTrades = useMemo(() => {
    return [...trades]
      .sort((a, b) => b.closeTime.getTime() - a.closeTime.getTime())
      .slice(0, 10);
  }, [trades]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Trades</h3>
      <div className="space-y-0">
        <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border text-xs text-muted-foreground">
          <span>Entry Date</span>
          <span>Symbol</span>
          <span className="text-right">Gross P&L</span>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {recentTrades.map((trade, index) => (
            <div 
              key={trade.ticket} 
              className="grid grid-cols-3 gap-2 py-2 border-b border-border/50 text-sm"
            >
              <span className="text-muted-foreground">
                {trade.closeTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </span>
              <span className="font-medium">{trade.symbol}</span>
              <span className={`text-right font-semibold ${trade.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {trade.netProfit >= 0 ? '+' : ''} ${trade.netProfit.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
