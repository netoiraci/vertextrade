import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Trade } from "@/lib/parseTradeReport";

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
      date: new Date(trade.closeTime).toLocaleDateString(),
    });
    
    return acc;
  }, [] as { index: number; balance: number; date: string }[]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Curva de Capital</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160 84% 39%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160 84% 39%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="index" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
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
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(160 84% 39%)"
            strokeWidth={2}
            fill="url(#profitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
