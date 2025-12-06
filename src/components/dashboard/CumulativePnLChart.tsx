import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { Info } from "lucide-react";

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
        date: trade.closeTime.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        pnl: cumulative,
        trade: trade.netProfit
      };
    });
  }, [trades]);

  // Calculate dynamic Y-axis domain for better visualization
  const pnlValues = chartData.map(d => d.pnl);
  const minPnL = Math.min(...pnlValues, 0);
  const maxPnL = Math.max(...pnlValues, 0);
  
  // Add padding to show variations better
  const range = Math.max(Math.abs(maxPnL), Math.abs(minPnL));
  const padding = range * 0.15;
  const yMin = Math.floor((minPnL - padding) / 50) * 50;
  const yMax = Math.ceil((maxPnL + padding) / 50) * 50;

  // Determine if overall is positive or negative
  const isNegative = chartData.length > 0 && chartData[chartData.length - 1].pnl < 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-1 mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Cumulative Net Profit Curve</h3>
        <Info className="h-3 w-3 text-muted-foreground" />
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="profitGradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="profitGradientNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--danger))" stopOpacity={0.4} />
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
            domain={[yMin, yMax]}
            tickCount={8}
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
            stroke={isNegative ? "hsl(var(--danger))" : "hsl(var(--success))"}
            strokeWidth={2}
            fill={isNegative ? "url(#profitGradientNegative)" : "url(#profitGradientPositive)"}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
