import { Trade } from "@/lib/parseTradeReport";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { useMemo } from "react";

interface PerformanceChartsProps {
  trades: Trade[];
}

export function PerformanceCharts({ trades }: PerformanceChartsProps) {
  const monthlyData = useMemo(() => {
    const months = new Map<string, number>();
    
    trades.forEach((trade) => {
      const monthKey = trade.closeTime.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const current = months.get(monthKey) || 0;
      months.set(monthKey, current + trade.netProfit);
    });

    return Array.from(months.entries())
      .map(([month, pnl]) => ({ month, pnl }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  }, [trades]);

  const symbolData = useMemo(() => {
    const symbols = new Map<string, { trades: number; pnl: number }>();
    
    trades.forEach((trade) => {
      const symbol = trade.symbol.toUpperCase();
      const current = symbols.get(symbol) || { trades: 0, pnl: 0 };
      symbols.set(symbol, {
        trades: current.trades + 1,
        pnl: current.pnl + trade.netProfit,
      });
    });

    return Array.from(symbols.entries())
      .map(([symbol, data]) => ({ symbol, ...data }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 10);
  }, [trades]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly P&L */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly P&L</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
            />
            <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(160 84% 39%)" : "hsl(346 77% 50%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance by Symbol */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Symbols by P&L</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={symbolData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              type="category"
              dataKey="symbol" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
            />
            <Bar dataKey="pnl" radius={[0, 8, 8, 0]}>
              {symbolData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(160 84% 39%)" : "hsl(346 77% 50%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
