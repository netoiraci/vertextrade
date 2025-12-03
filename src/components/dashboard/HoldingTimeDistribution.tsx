import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface HoldingTimeDistributionProps {
  trades: Trade[];
}

const BUCKETS = [
  { key: 'scalp', label: 'Scalp', subtitle: '< 5min', maxMinutes: 5 },
  { key: 'curto', label: 'Curto', subtitle: '5-30min', maxMinutes: 30 },
  { key: 'medio', label: 'Médio', subtitle: '30min-2h', maxMinutes: 120 },
  { key: 'longo', label: 'Longo', subtitle: '> 2h', maxMinutes: Infinity },
];

export function HoldingTimeDistribution({ trades }: HoldingTimeDistributionProps) {
  const data = useMemo(() => {
    const bucketData = BUCKETS.map(bucket => ({
      ...bucket,
      pnl: 0,
      count: 0,
    }));

    trades.forEach(trade => {
      const durationMinutes = trade.duration; // já está em minutos
      
      let bucketIndex = 0;
      if (durationMinutes >= 5 && durationMinutes < 30) bucketIndex = 1;
      else if (durationMinutes >= 30 && durationMinutes < 120) bucketIndex = 2;
      else if (durationMinutes >= 120) bucketIndex = 3;
      
      bucketData[bucketIndex].pnl += trade.netProfit;
      bucketData[bucketIndex].count += 1;
    });

    return bucketData;
  }, [trades]);

  const maxAbsPnL = Math.max(...data.map(d => Math.abs(d.pnl)), 1);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary font-bold">|</span>
        <h3 className="text-sm font-semibold text-foreground">Distribuição por Holding Time</h3>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <XAxis 
              type="number" 
              domain={[-maxAbsPnL, maxAbsPnL]}
              tickFormatter={(value) => `$${Math.abs(value).toFixed(0)}`}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              type="category" 
              dataKey="label"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={50}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string, props: any) => [
                <span className={value >= 0 ? 'text-success' : 'text-danger'}>
                  {value >= 0 ? '+' : ''}${value.toFixed(2)}
                </span>,
                'P&L'
              ]}
              labelFormatter={(label, payload) => {
                const item = payload?.[0]?.payload;
                return item ? `${label} (${item.subtitle}) - ${item.count} trades` : label;
              }}
            />
            <ReferenceLine x={0} stroke="hsl(var(--border))" />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.pnl >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Insight */}
      <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
        <p className="text-xs text-muted-foreground">
          {(() => {
            const bestBucket = data.reduce((best, curr) => curr.pnl > best.pnl ? curr : best, data[0]);
            const worstBucket = data.reduce((worst, curr) => curr.pnl < worst.pnl ? curr : worst, data[0]);
            
            if (bestBucket.pnl > 0 && worstBucket.pnl < 0) {
              return `💡 Melhor performance em trades "${bestBucket.label}". Evite operações "${worstBucket.label}".`;
            }
            return '💡 Analise a duração ideal das suas operações para maximizar resultados.';
          })()}
        </p>
      </div>
    </div>
  );
}
