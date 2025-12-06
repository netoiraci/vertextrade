import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Info } from "lucide-react";

interface EquityCurveProps {
  trades: Trade[];
  initialBalance?: number;
}

export function EquityCurve({ trades, initialBalance = 10000 }: EquityCurveProps) {
  // Sort trades by close time to ensure correct order
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
  );

  const data = sortedTrades.reduce((acc, trade, index) => {
    const previousBalance = index === 0 ? initialBalance : acc[index - 1].balance;
    const newBalance = previousBalance + trade.netProfit;
    
    acc.push({
      index: index + 1,
      balance: newBalance,
      pnl: newBalance - initialBalance,
      date: new Date(trade.closeTime).toLocaleDateString(),
    });
    
    return acc;
  }, [] as { index: number; balance: number; pnl: number; date: string }[]);

  // Calculate dynamic Y-axis domain with enhanced scaling
  const yDomain = useMemo(() => {
    if (data.length === 0) return [initialBalance * 0.95, initialBalance * 1.05];
    
    const balances = data.map(d => d.balance);
    const minBalance = Math.min(...balances);
    const maxBalance = Math.max(...balances);
    
    // Calculate range and add padding for better visualization
    const range = maxBalance - minBalance;
    const padding = Math.max(range * 0.15, initialBalance * 0.01);
    
    return [
      Math.floor((minBalance - padding) / 100) * 100,
      Math.ceil((maxBalance + padding) / 100) * 100
    ];
  }, [data, initialBalance]);

  // Determine if overall performance is positive or negative
  const isPositive = data.length > 0 && data[data.length - 1].balance >= initialBalance;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Equity Curve</h3>
        <span className="text-xs text-muted-foreground">(Curva de Capital)</span>
        <Info className="h-4 w-4 text-muted-foreground" />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityPositiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="equityNegativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(350 89% 60%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(350 89% 60%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="index" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            domain={yDomain}
            tickCount={8}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <ReferenceLine 
            y={initialBalance} 
            stroke="hsl(var(--muted-foreground))" 
            strokeDasharray="3 3"
            strokeOpacity={0.5}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Balance']}
            labelFormatter={(label) => `Trade #${label}`}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke={isPositive ? "hsl(160 84% 39%)" : "hsl(350 89% 60%)"}
            strokeWidth={2}
            fill={isPositive ? "url(#equityPositiveGradient)" : "url(#equityNegativeGradient)"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
