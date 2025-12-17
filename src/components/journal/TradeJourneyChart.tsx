import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/lib/parseTradeReport';
import { generateTradePriceEvolution, TradePricePoint } from '@/lib/tradeUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LineChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CircleDot } from 'lucide-react';

interface TradeJourneyChartProps {
  trade: Trade | null;
}

export function TradeJourneyChart({ trade }: TradeJourneyChartProps) {
  if (!trade) {
    return (
      <Card className="h-[400px] flex items-center justify-center border-dashed border-border">
        <CardContent className="flex flex-col items-center">
          <div className="relative">
            <TrendingUp className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Selecione um trade na tabela</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Clique em qualquer operação para ver a evolução do preço
          </p>
        </CardContent>
      </Card>
    );
  }

  const priceData = generateTradePriceEvolution(trade);
  const isProfitable = trade.netProfit >= 0;
  const gradientColor = isProfitable ? 'hsl(var(--success))' : 'hsl(var(--danger))';
  const lineColor = isProfitable ? 'hsl(var(--success))' : 'hsl(var(--danger))';

  const formatXAxis = (timestamp: number) => {
    return format(new Date(timestamp), 'HH:mm');
  };

  const formatYAxis = (value: number) => {
    return value.toFixed(5);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const diff = data.price - trade.openPrice;
      const diffPips = (Math.abs(diff) * 10000).toFixed(1);
      const isProfitableMove = (trade.type === 'buy' && diff > 0) || (trade.type === 'sell' && diff < 0);
      
      return (
        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg shadow-xl p-3 text-xs">
          <p className="font-semibold mb-2 text-sm text-popover-foreground">
            {format(new Date(data.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
          </p>
          <div className="space-y-1">
            <p className="text-muted-foreground flex justify-between gap-4">
              <span>Preço:</span>
              <span className="font-semibold text-popover-foreground">{data.price.toFixed(5)}</span>
            </p>
            <p className="text-muted-foreground flex justify-between gap-4">
              <span>Dist. Entrada:</span>
              <span className={`font-semibold ${isProfitableMove ? 'text-success' : 'text-danger'}`}>
                {diff > 0 ? '+' : ''}{diffPips} pips
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
    if (index === 0) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={trade.type === 'buy' ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
      );
    }
    if (index === priceData.length - 1) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={5}
          fill={trade.type === 'buy' ? 'hsl(var(--danger))' : 'hsl(var(--success))'}
          stroke="hsl(var(--background))"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  return (
    <Card className="border-border">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-base font-normal text-muted-foreground">
              Ticket
            </span>
            <span className="text-base font-mono font-bold text-foreground">
              #{trade.ticket}
            </span>
          </CardTitle>
          <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'} className="text-sm px-3 py-1">
            {trade.type === 'buy' ? 'BUY' : 'SELL'} {trade.size.toFixed(2)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{trade.symbol}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">
            {format(trade.openTime, 'dd MMM yyyy', { locale: ptBR })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={priceData} margin={{ top: 35, right: 25, left: 15, bottom: 25 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={formatXAxis}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              tickFormatter={formatYAxis}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="price"
              stroke="none"
              fill="url(#colorPrice)"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        <div className="flex items-center justify-between mt-4 text-xs">
          <div className="flex items-center gap-2">
            <CircleDot className={`w-4 h-4 ${trade.type === 'buy' ? 'text-success' : 'text-danger'}`} />
            <span className="text-muted-foreground">
              Entrada: <span className="font-semibold text-foreground">{trade.openPrice.toFixed(5)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CircleDot className={`w-4 h-4 ${trade.type === 'buy' ? 'text-danger' : 'text-success'}`} />
            <span className="text-muted-foreground">
              Saída: <span className="font-semibold text-foreground">{trade.closePrice.toFixed(5)}</span>
            </span>
          </div>
        </div>
        
        {/* Chart Legend */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${trade.type === 'buy' ? 'bg-success' : 'bg-danger'}`}></div>
            <span className="text-muted-foreground">Ponto de Entrada ({trade.type === 'buy' ? 'BUY' : 'SELL'})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${trade.type === 'buy' ? 'bg-danger' : 'bg-success'}`}></div>
            <span className="text-muted-foreground">Ponto de Saída</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
