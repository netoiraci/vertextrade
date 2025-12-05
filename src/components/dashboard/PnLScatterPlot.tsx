import { useMemo } from "react";
import { Trade } from "@/lib/parseTradeReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

interface PnLScatterPlotProps {
  trades: Trade[];
}

export function PnLScatterPlot({ trades }: PnLScatterPlotProps) {
  const scatterData = useMemo(() => {
    return trades.map(t => ({
      duration: Math.min(t.duration, 480), // Cap at 8 hours for visualization
      pnl: t.netProfit,
      symbol: t.symbol,
      isWin: t.isWin,
      actualDuration: t.duration,
    }));
  }, [trades]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground">{data.symbol.toUpperCase()}</p>
        <p className={`text-sm ${data.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
          P&L: ${data.pnl.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          Duração: {formatDuration(data.actualDuration)}
        </p>
      </div>
    );
  };

  if (trades.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">P&L vs Duração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey="duration" 
                  name="Duração" 
                  unit="min"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => formatDuration(value)}
                  label={{ 
                    value: 'Duração', 
                    position: 'bottom', 
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 11,
                    offset: 0
                  }}
                />
                <YAxis 
                  type="number" 
                  dataKey="pnl" 
                  name="P&L" 
                  unit="$"
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickFormatter={(value) => `$${value}`}
                  label={{ 
                    value: 'P&L ($)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 11
                  }}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Trades" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isWin ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
                      opacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Verde = Lucro | Vermelho = Prejuízo
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
