import { Card, CardContent } from '@/components/ui/card';
import { Trade } from '@/lib/parseTradeReport';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';
import { formatPnL } from '@/lib/tradeUtils';

interface JournalHeaderProps {
  trades: Trade[];
}

export function JournalHeader({ trades }: JournalHeaderProps) {
  const totalPnL = trades.reduce((sum, trade) => sum + trade.netProfit, 0);
  const winningTrades = trades.filter(t => t.netProfit > 0).length;
  const losingTrades = trades.filter(t => t.netProfit < 0).length;
  const winRate = trades.length > 0 ? ((winningTrades / trades.length) * 100).toFixed(1) : '0.0';
  const avgPnL = trades.length > 0 ? totalPnL / trades.length : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary/80">Total Trades</p>
              <p className="text-3xl font-bold text-primary">{trades.length}</p>
            </div>
            <Activity className="h-10 w-10 text-primary/50" />
          </div>
        </CardContent>
      </Card>

      <Card className={`bg-gradient-to-br ${totalPnL >= 0 ? 'from-success/10 to-success/5 border-success/20' : 'from-danger/10 to-danger/5 border-danger/20'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${totalPnL >= 0 ? 'text-success/80' : 'text-danger/80'}`}>
                PnL Total
              </p>
              <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPnL(totalPnL)}
              </p>
            </div>
            {totalPnL >= 0 ? (
              <TrendingUp className="h-10 w-10 text-success/50" />
            ) : (
              <TrendingDown className="h-10 w-10 text-danger/50" />
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-chart-4/80">Win Rate</p>
              <p className="text-3xl font-bold text-chart-4">{winRate}%</p>
              <p className="text-xs text-chart-4/60 mt-1">
                {winningTrades}W / {losingTrades}L
              </p>
            </div>
            <Target className="h-10 w-10 text-chart-4/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-chart-5/10 to-chart-5/5 border-chart-5/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-chart-5/80">Média PnL</p>
              <p className={`text-2xl font-bold ${avgPnL >= 0 ? 'text-chart-5' : 'text-danger'}`}>
                {formatPnL(avgPnL)}
              </p>
              <p className="text-xs text-chart-5/60 mt-1">
                por operação
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-chart-5/50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
