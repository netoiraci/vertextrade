import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Trade } from "@/lib/parseTradeReport";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DrawdownChartProps {
  trades: Trade[];
  initialBalance: number;
}

export function DrawdownChart({ trades, initialBalance }: DrawdownChartProps) {
  const drawdownData = useMemo(() => {
    if (trades.length === 0) return [];

    // Sort trades by close time
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
    );

    let balance = initialBalance;
    let peak = initialBalance;
    const data: { date: string; balance: number; drawdown: number; drawdownPercent: number }[] = [];

    // Add initial point
    data.push({
      date: format(new Date(sortedTrades[0].closeTime), "dd/MM", { locale: ptBR }),
      balance: initialBalance,
      drawdown: 0,
      drawdownPercent: 0,
    });

    sortedTrades.forEach((trade) => {
      balance += trade.netProfit;
      
      // Update peak if we have a new high
      if (balance > peak) {
        peak = balance;
      }
      
      // Calculate drawdown from peak
      const drawdown = balance - peak;
      const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

      data.push({
        date: format(new Date(trade.closeTime), "dd/MM", { locale: ptBR }),
        balance,
        drawdown,
        drawdownPercent,
      });
    });

    return data;
  }, [trades, initialBalance]);

  const maxDrawdown = useMemo(() => {
    if (drawdownData.length === 0) return { value: 0, percent: 0 };
    const minDrawdown = Math.min(...drawdownData.map(d => d.drawdown));
    const minDrawdownPercent = Math.min(...drawdownData.map(d => d.drawdownPercent));
    return { value: minDrawdown, percent: minDrawdownPercent };
  }, [drawdownData]);

  if (trades.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Drawdown</h3>
        <p className="text-muted-foreground text-center py-8">
          Importe trades para visualizar o drawdown
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Drawdown (Perda Acumulada Máxima)</h3>
        <div className="flex gap-4 text-sm">
          <div className="text-muted-foreground">
            Max Drawdown: <span className="text-danger font-semibold">${maxDrawdown.value.toFixed(2)}</span>
          </div>
          <div className="text-muted-foreground">
            Max DD %: <span className="text-danger font-semibold">{maxDrawdown.percent.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={drawdownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(351, 95%, 61%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(351, 95%, 61%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(220, 9%, 61%)"
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(220, 9%, 61%)"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 7%)",
                border: "1px solid hsl(0, 0%, 15%)",
                borderRadius: "8px",
                color: "hsl(210, 17%, 91%)",
              }}
              formatter={(value: number, name: string) => {
                if (name === "drawdown") return [`$${value.toFixed(2)}`, "Drawdown"];
                return [value, name];
              }}
            />
            <ReferenceLine y={0} stroke="hsl(220, 9%, 61%)" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="hsl(351, 95%, 61%)"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
