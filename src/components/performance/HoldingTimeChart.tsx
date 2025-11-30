import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface HoldingTimeChartProps {
  trades: Trade[];
}

export function HoldingTimeChart({ trades }: HoldingTimeChartProps) {
  const data = useMemo(() => {
    const ranges = [
      { label: 'Under 1 min', min: 0, max: 60 },
      { label: '1 to 4:59', min: 60, max: 300 },
      { label: '5 to 14:59', min: 300, max: 900 },
      { label: '15 to 29:59', min: 900, max: 1800 },
      { label: '30 to 59:59', min: 1800, max: 3600 },
      { label: '1h to 3h', min: 3600, max: 10800 },
      { label: 'More than 3h', min: 10800, max: Infinity },
    ];

    return ranges.map(range => {
      const rangeTrades = trades.filter(t => {
        const duration = t.duration;
        return duration >= range.min && duration < range.max;
      });
      const pnl = rangeTrades.reduce((sum, t) => sum + t.netProfit, 0);
      return { name: range.label, pnl, count: rangeTrades.length };
    });
  }, [trades]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Holding Time</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={90} />
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
