import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface BestWorstTradesProps {
  trades: Trade[];
  type: 'best' | 'worst';
}

export function BestWorstTrades({ trades, type }: BestWorstTradesProps) {
  const data = useMemo(() => {
    const sorted = [...trades].sort((a, b) => 
      type === 'best' ? b.netProfit - a.netProfit : a.netProfit - b.netProfit
    );
    
    return sorted.slice(0, 5).map(trade => ({
      name: `${trade.symbol} - ${trade.closeTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`,
      pnl: trade.netProfit,
      symbol: trade.symbol
    }));
  }, [trades, type]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        {type === 'best' ? 'Best Trades' : 'Worst Trades'}
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={100} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          />
          <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={type === 'best' ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
