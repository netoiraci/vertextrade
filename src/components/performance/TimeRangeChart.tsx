import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface TimeRangeChartProps {
  trades: Trade[];
}

export function TimeRangeChart({ trades }: TimeRangeChartProps) {
  const data = useMemo(() => {
    const timeRanges = [
      { label: '9 AM - 10 AM', start: 9, end: 10 },
      { label: '11 AM - 12 PM', start: 11, end: 12 },
      { label: '1 PM - 2 PM', start: 13, end: 14 },
      { label: '3 PM - 4 PM', start: 15, end: 16 },
      { label: '5 PM - 6 PM', start: 17, end: 18 },
      { label: '7 PM - 8 PM', start: 19, end: 20 },
    ];

    return timeRanges.map(range => {
      const rangeTrades = trades.filter(t => {
        const hour = t.openTime.getHours();
        return hour >= range.start && hour < range.end;
      });
      const pnl = rangeTrades.reduce((sum, t) => sum + t.netProfit, 0);
      return { name: range.label, pnl, count: rangeTrades.length };
    });
  }, [trades]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Entry Time Range</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={80} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
          />
          <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
