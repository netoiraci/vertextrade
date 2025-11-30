import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface MonthlyPnLChartProps {
  trades: Trade[];
}

export function MonthlyPnLChart({ trades }: MonthlyPnLChartProps) {
  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    
    trades.forEach(trade => {
      const month = trade.closeTime.toLocaleDateString('en-US', { month: 'short' });
      const current = monthMap.get(month) || 0;
      monthMap.set(month, current + trade.netProfit);
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      pnl: monthMap.get(month) || 0
    }));
  }, [trades]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Monthly Gross P&L</h3>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
          <Line 
            type="monotone" 
            dataKey="pnl" 
            stroke="hsl(var(--success))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--success))', strokeWidth: 0, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
