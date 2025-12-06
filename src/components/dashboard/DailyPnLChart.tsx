import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from "recharts";
import { Info } from "lucide-react";

interface DailyPnLChartProps {
  trades: Trade[];
}

export function DailyPnLChart({ trades }: DailyPnLChartProps) {
  const dailyData = useMemo(() => {
    if (trades.length === 0) return [];

    // Group trades by day and sum P&L
    const dayMap = new Map<string, number>();
    
    trades.forEach(trade => {
      const dateKey = trade.closeTime.toISOString().split('T')[0];
      const current = dayMap.get(dateKey) || 0;
      dayMap.set(dateKey, current + trade.netProfit);
    });

    // Convert to array, filter only days with trades, and sort chronologically
    const daysWithTrades: { date: string; pnl: number; displayDate: string }[] = [];
    dayMap.forEach((pnl, date) => {
      daysWithTrades.push({ 
        date, 
        pnl,
        displayDate: date.slice(5).replace('-', '/')
      });
    });

    // Sort and take the last 30 days with trades
    return daysWithTrades
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
  }, [trades]);

  const minPnL = Math.min(...dailyData.map(d => d.pnl), 0);
  const maxPnL = Math.max(...dailyData.map(d => d.pnl), 0);
  const yDomain = [Math.floor(minPnL * 1.2), Math.ceil(maxPnL * 1.2)];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Last 30 Days Net P&L</h3>
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            interval={4}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${value}`}
            domain={yDomain}
          />
          <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Net P&L']}
          />
          <Bar dataKey="pnl" radius={[2, 2, 0, 0]} maxBarSize={12}>
            {dailyData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
