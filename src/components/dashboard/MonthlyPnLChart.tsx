import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Info } from "lucide-react";

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

  const minPnL = Math.min(...monthlyData.map(d => d.pnl));
  const maxPnL = Math.max(...monthlyData.map(d => d.pnl));
  const padding = Math.max(Math.abs(maxPnL), Math.abs(minPnL)) * 0.2;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Monthly Net P&L</h3>
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={[minPnL - padding, maxPnL + padding]}
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
