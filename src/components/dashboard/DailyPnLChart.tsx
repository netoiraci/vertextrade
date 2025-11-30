import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface DailyPnLChartProps {
  trades: Trade[];
}

export function DailyPnLChart({ trades }: DailyPnLChartProps) {
  const dailyData = useMemo(() => {
    const dayMap = new Map<string, number>();
    
    // Get last 30 days
    const today = new Date();
    const last30Days: { date: string; pnl: number }[] = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dayMap.set(dateKey, 0);
    }

    trades.forEach(trade => {
      const dateKey = trade.closeTime.toISOString().split('T')[0];
      if (dayMap.has(dateKey)) {
        const current = dayMap.get(dateKey) || 0;
        dayMap.set(dateKey, current + trade.netProfit);
      }
    });

    dayMap.forEach((pnl, date) => {
      last30Days.push({ date, pnl });
    });

    return last30Days.sort((a, b) => a.date.localeCompare(b.date));
  }, [trades]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Last 30 Days Gross P&L</h3>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => value.slice(5)}
            interval={6}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          />
          <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
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
