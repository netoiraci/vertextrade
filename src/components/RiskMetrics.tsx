import { useMemo } from "react";
import { Trade } from "@/lib/parseTradeReport";
import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertTriangle, Target, Percent, Activity, BarChart3, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskMetricsProps {
  trades: Trade[];
  initialBalance: number;
}

interface RiskMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  tooltip: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

function RiskMetricCard({ title, value, subtitle, icon: Icon, tooltip, trend = "neutral", delay = 0 }: RiskMetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-foreground",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all duration-300 cursor-help"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
                <p className={`text-2xl font-bold mt-2 ${trendColors[trend]}`}>
                  {value}
                </p>
                {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function RiskMetrics({ trades, initialBalance }: RiskMetricsProps) {
  const riskMetrics = useMemo(() => {
    if (trades.length === 0) return null;

    // Sort trades by close time
    const sortedTrades = [...trades].sort(
      (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
    );

    // Calculate returns for each trade
    const returns = sortedTrades.map(t => t.netProfit);
    const totalPnL = returns.reduce((sum, r) => sum + r, 0);
    
    // Calculate equity curve for drawdown
    let balance = initialBalance;
    let peak = initialBalance;
    let maxDrawdown = 0;
    let maxDrawdownPercent = 0;

    sortedTrades.forEach((trade) => {
      balance += trade.netProfit;
      if (balance > peak) peak = balance;
      const dd = peak - balance;
      const ddPercent = peak > 0 ? (dd / peak) * 100 : 0;
      if (dd > maxDrawdown) maxDrawdown = dd;
      if (ddPercent > maxDrawdownPercent) maxDrawdownPercent = ddPercent;
    });

    // Average return per trade
    const avgReturn = totalPnL / trades.length;
    
    // Standard deviation of returns
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    // Downside deviation (only negative returns)
    const negativeReturns = returns.filter(r => r < 0);
    const downsideVariance = negativeReturns.length > 0 
      ? negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / returns.length
      : 0;
    const downsideDeviation = Math.sqrt(downsideVariance);

    // Sharpe Ratio (simplified, assuming risk-free rate = 0)
    // Usando sqrt do número de trades para normalização ao invés de assumir 252 dias
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(Math.min(trades.length, 252)) : 0;
    
    // Sortino Ratio (mesma normalização)
    const sortinoRatio = downsideDeviation > 0 
      ? (avgReturn / downsideDeviation) * Math.sqrt(Math.min(trades.length, 252)) 
      : avgReturn > 0 ? Infinity : 0;

    // Recovery Factor = Net Profit / Max Drawdown
    const recoveryFactor = maxDrawdown > 0 ? totalPnL / maxDrawdown : totalPnL > 0 ? Infinity : 0;

    // Payoff Ratio = Average Win / Average Loss
    const wins = trades.filter(t => t.isWin);
    const losses = trades.filter(t => !t.isWin);
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.netProfit, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.netProfit, 0) / losses.length) : 0;
    const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    // Win Rate
    const winRate = (wins.length / trades.length) * 100;

    // Profit Factor
    const grossProfit = wins.reduce((sum, t) => sum + t.netProfit, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.netProfit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    // Calmar Ratio = Annual Return / Max Drawdown
    // Simplified: (Total Return / Max Drawdown) * number of trades adjustment
    const calmarRatio = maxDrawdown > 0 ? (totalPnL / maxDrawdown) : totalPnL > 0 ? Infinity : 0;

    // Kelly Criterion = W - [(1-W)/R] where W = win rate, R = payoff ratio
    const kellyPercent = payoffRatio > 0 && payoffRatio !== Infinity
      ? ((winRate / 100) - ((1 - winRate / 100) / payoffRatio)) * 100
      : 0;

    // Return on Maximum Drawdown (RoMaD)
    const romad = maxDrawdown > 0 ? (totalPnL / maxDrawdown) * 100 : 0;

    // CPC Index = (Win Rate × Payoff Ratio) / (1 + Payoff Ratio)
    const cpcIndex = (1 + payoffRatio) > 0 
      ? ((winRate / 100) * payoffRatio) / (1 + payoffRatio) 
      : 0;

    return {
      sharpeRatio,
      sortinoRatio,
      recoveryFactor,
      payoffRatio,
      maxDrawdown,
      maxDrawdownPercent,
      profitFactor,
      winRate,
      kellyPercent,
      romad,
      calmarRatio,
      cpcIndex,
      avgReturn,
      stdDev,
    };
  }, [trades, initialBalance]);

  if (!riskMetrics) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Métricas de Risco</h3>
        <p className="text-muted-foreground text-center py-8">
          Importe trades para visualizar as métricas de risco
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Métricas de Risco Avançadas</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RiskMetricCard
          title="Sharpe Ratio"
          value={riskMetrics.sharpeRatio === Infinity ? "∞" : riskMetrics.sharpeRatio.toFixed(2)}
          subtitle="Anualizado"
          icon={TrendingUp}
          tooltip="Mede o retorno ajustado ao risco. Valores > 1 são bons, > 2 excelentes."
          trend={riskMetrics.sharpeRatio >= 1 ? "up" : riskMetrics.sharpeRatio >= 0 ? "neutral" : "down"}
          delay={0}
        />

        <RiskMetricCard
          title="Sortino Ratio"
          value={riskMetrics.sortinoRatio === Infinity ? "∞" : riskMetrics.sortinoRatio.toFixed(2)}
          subtitle="Risco de baixa"
          icon={Shield}
          tooltip="Similar ao Sharpe, mas considera apenas volatilidade negativa. Mais preciso para traders."
          trend={riskMetrics.sortinoRatio >= 1 ? "up" : riskMetrics.sortinoRatio >= 0 ? "neutral" : "down"}
          delay={0.05}
        />

        <RiskMetricCard
          title="Recovery Factor"
          value={riskMetrics.recoveryFactor === Infinity ? "∞" : riskMetrics.recoveryFactor.toFixed(2)}
          subtitle="Lucro / DD"
          icon={Activity}
          tooltip="Relação entre lucro total e máximo drawdown. Quanto maior, melhor a recuperação."
          trend={riskMetrics.recoveryFactor >= 3 ? "up" : riskMetrics.recoveryFactor >= 1 ? "neutral" : "down"}
          delay={0.1}
        />

        <RiskMetricCard
          title="Payoff Ratio"
          value={riskMetrics.payoffRatio === Infinity ? "∞" : riskMetrics.payoffRatio.toFixed(2)}
          subtitle="Ganho/Perda médio"
          icon={Target}
          tooltip="Relação entre ganho médio e perda média. Ideal > 1.5"
          trend={riskMetrics.payoffRatio >= 1.5 ? "up" : riskMetrics.payoffRatio >= 1 ? "neutral" : "down"}
          delay={0.15}
        />

        <RiskMetricCard
          title="Max Drawdown"
          value={`$${riskMetrics.maxDrawdown.toFixed(2)}`}
          subtitle={`${riskMetrics.maxDrawdownPercent.toFixed(2)}%`}
          icon={AlertTriangle}
          tooltip="Maior queda do pico ao vale. Essencial para gestão de risco."
          trend={riskMetrics.maxDrawdownPercent <= 10 ? "up" : riskMetrics.maxDrawdownPercent <= 20 ? "neutral" : "down"}
          delay={0.2}
        />

        <RiskMetricCard
          title="Kelly %"
          value={`${riskMetrics.kellyPercent.toFixed(1)}%`}
          subtitle="Fração ótima"
          icon={Percent}
          tooltip="Percentual ótimo do capital por operação segundo o Critério de Kelly."
          trend={riskMetrics.kellyPercent > 0 ? "up" : "down"}
          delay={0.25}
        />

        <RiskMetricCard
          title="Calmar Ratio"
          value={riskMetrics.calmarRatio === Infinity ? "∞" : riskMetrics.calmarRatio.toFixed(2)}
          subtitle="Retorno/DD"
          icon={BarChart3}
          tooltip="Retorno dividido pelo drawdown máximo. Mede eficiência do risco."
          trend={riskMetrics.calmarRatio >= 3 ? "up" : riskMetrics.calmarRatio >= 1 ? "neutral" : "down"}
          delay={0.3}
        />

        <RiskMetricCard
          title="CPC Index"
          value={riskMetrics.cpcIndex.toFixed(3)}
          subtitle="Consistência"
          icon={Zap}
          tooltip="Common Profit/Loss Ratio. Mede consistência da estratégia. Ideal > 0.2"
          trend={riskMetrics.cpcIndex >= 0.2 ? "up" : riskMetrics.cpcIndex >= 0.1 ? "neutral" : "down"}
          delay={0.35}
        />
      </div>
    </div>
  );
}
