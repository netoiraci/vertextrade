import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

interface CumulativePnLChartProps {
  trades: Trade[];
  initialBalance?: number;
}

export function CumulativePnLChart({ trades, initialBalance = 10000 }: CumulativePnLChartProps) {
  const chartData = useMemo(() => {
    const sortedTrades = [...trades].sort(
      (a, b) => a.closeTime.getTime() - b.closeTime.getTime()
    );

    let cumulative = 0;
    return sortedTrades.map((trade) => {
      cumulative += trade.netProfit;
      return {
        date: trade.closeTime.toLocaleDateString('pt-BR'),
        pnl: cumulative,
        trade: trade.netProfit
      };
    });
  }, [trades]);

  const minPnL = Math.min(...chartData.map(d => d.pnl), 0);
  const maxPnL = Math.max(...chartData.map(d => d.pnl), 0);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Cumulative Gross Profit Curve</h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--danger))" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            interval="preserveStartEnd"
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={[minPnL * 1.1, maxPnL * 1.1]}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cumulative P&L']}
          />
          <Area
            type="monotone"
            dataKey="pnl"
            stroke="hsl(var(--danger))"
            strokeWidth={2}
            fill="url(#profitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
