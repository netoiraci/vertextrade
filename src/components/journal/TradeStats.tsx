import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { Trade } from '@/lib/parseTradeReport';
import { calculateDuration, formatPnL, getPnLColor } from '@/lib/tradeUtils';

interface TradeStatsProps {
  trade: Trade;
}

export function TradeStats({ trade }: TradeStatsProps) {
  const duration = calculateDuration(trade.openTime, trade.closeTime);
  const priceRange = Math.abs(trade.closePrice - trade.openPrice);
  const pips = (Math.abs(trade.closePrice - trade.openPrice) * 10000).toFixed(1);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Duração</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold">{duration}</div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Variação</CardTitle>
          {trade.netProfit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-xl font-bold">{pips} pips</div>
          <p className="text-xs text-muted-foreground">
            {priceRange.toFixed(5)} pts
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">PnL</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className={`text-2xl font-bold ${getPnLColor(trade.netProfit)}`}>
            {formatPnL(trade.netProfit)}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 pt-4">
          <CardTitle className="text-sm font-medium">Volume</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold">{trade.size.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            lotes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
