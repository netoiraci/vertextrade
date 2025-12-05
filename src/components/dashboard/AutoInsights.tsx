import { useMemo } from "react";
import { Trade } from "@/lib/parseTradeReport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Clock, Ban, Target, Zap, Brain, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getHours, getDay, format } from "date-fns";

interface AutoInsightsProps {
  trades: Trade[];
}

interface Insight {
  id: string;
  type: "warning" | "danger" | "success" | "info";
  icon: React.ReactNode;
  title: string;
  message: string;
}

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function AutoInsights({ trades }: AutoInsightsProps) {
  const insights = useMemo(() => {
    if (trades.length < 5) return [];

    const results: Insight[] = [];
    
    const wins = trades.filter(t => t.isWin);
    const losses = trades.filter(t => !t.isWin);

    // 1. Análise de Disciplina: Tempo médio de wins vs losses
    if (wins.length > 0 && losses.length > 0) {
      const avgWinDuration = wins.reduce((sum, t) => sum + t.duration, 0) / wins.length;
      const avgLossDuration = losses.reduce((sum, t) => sum + t.duration, 0) / losses.length;
      
      if (avgLossDuration > avgWinDuration * 1.5) {
        const ratio = (avgLossDuration / avgWinDuration).toFixed(1);
        results.push({
          id: "discipline",
          type: "danger",
          icon: <AlertTriangle className="h-5 w-5" />,
          title: "Alerta de Disciplina",
          message: `Você segura perdas ${ratio}x mais tempo que ganhos. Considere cortar perdas mais rápido.`,
        });
      } else if (avgWinDuration > avgLossDuration * 1.5) {
        results.push({
          id: "discipline-good",
          type: "success",
          icon: <TrendingUp className="h-5 w-5" />,
          title: "Boa Disciplina",
          message: `Você deixa os lucros correrem e corta as perdas rapidamente. Continue assim!`,
        });
      }
    }

    // 2. Horário Tóxico: Identificar a hora com pior P&L
    const hourlyPnL: Record<number, { pnl: number; count: number }> = {};
    trades.forEach(t => {
      const hour = getHours(t.openTime);
      if (!hourlyPnL[hour]) hourlyPnL[hour] = { pnl: 0, count: 0 };
      hourlyPnL[hour].pnl += t.netProfit;
      hourlyPnL[hour].count++;
    });

    const worstHour = Object.entries(hourlyPnL)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => a[1].pnl - b[1].pnl)[0];

    if (worstHour && worstHour[1].pnl < -100) {
      results.push({
        id: "toxic-hour",
        type: "danger",
        icon: <Ban className="h-5 w-5" />,
        title: "Horário Tóxico",
        message: `Evite operar às ${worstHour[0]}h. Prejuízo acumulado de $${Math.abs(worstHour[1].pnl).toFixed(2)} em ${worstHour[1].count} trades.`,
      });
    }

    // Horário de Ouro
    const bestHour = Object.entries(hourlyPnL)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].pnl - a[1].pnl)[0];

    if (bestHour && bestHour[1].pnl > 100) {
      results.push({
        id: "golden-hour",
        type: "success",
        icon: <Zap className="h-5 w-5" />,
        title: "Horário de Ouro",
        message: `Seu melhor horário é às ${bestHour[0]}h. Lucro de $${bestHour[1].pnl.toFixed(2)} em ${bestHour[1].count} trades.`,
      });
    }

    // 3. Dia da Semana Tóxico
    const weekdayPnL: Record<number, { pnl: number; count: number }> = {};
    trades.forEach(t => {
      const day = getDay(t.openTime);
      if (!weekdayPnL[day]) weekdayPnL[day] = { pnl: 0, count: 0 };
      weekdayPnL[day].pnl += t.netProfit;
      weekdayPnL[day].count++;
    });

    const worstDay = Object.entries(weekdayPnL)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => a[1].pnl - b[1].pnl)[0];

    if (worstDay && worstDay[1].pnl < -200) {
      results.push({
        id: "toxic-day",
        type: "warning",
        icon: <Clock className="h-5 w-5" />,
        title: "Dia Problemático",
        message: `${WEEKDAYS[parseInt(worstDay[0])]} é seu pior dia. Prejuízo de $${Math.abs(worstDay[1].pnl).toFixed(2)} em ${worstDay[1].count} trades.`,
      });
    }

    // 4. Ativo Dreno: Identificar o ativo com pior P&L
    const symbolPnL: Record<string, { pnl: number; count: number }> = {};
    trades.forEach(t => {
      const symbol = t.symbol.toUpperCase();
      if (!symbolPnL[symbol]) symbolPnL[symbol] = { pnl: 0, count: 0 };
      symbolPnL[symbol].pnl += t.netProfit;
      symbolPnL[symbol].count++;
    });

    const worstSymbol = Object.entries(symbolPnL)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => a[1].pnl - b[1].pnl)[0];

    const totalLoss = losses.reduce((sum, t) => sum + Math.abs(t.netProfit), 0);

    if (worstSymbol && worstSymbol[1].pnl < -100 && totalLoss > 0) {
      const lossPercent = ((Math.abs(worstSymbol[1].pnl) / totalLoss) * 100).toFixed(0);
      results.push({
        id: "drain-asset",
        type: "danger",
        icon: <DollarSign className="h-5 w-5" />,
        title: "Ativo Dreno",
        message: `${worstSymbol[0]} é responsável por ${lossPercent}% das suas perdas ($${Math.abs(worstSymbol[1].pnl).toFixed(2)}).`,
      });
    }

    // Melhor ativo
    const bestSymbol = Object.entries(symbolPnL)
      .filter(([_, data]) => data.count >= 3)
      .sort((a, b) => b[1].pnl - a[1].pnl)[0];

    if (bestSymbol && bestSymbol[1].pnl > 100) {
      results.push({
        id: "best-asset",
        type: "success",
        icon: <Target className="h-5 w-5" />,
        title: "Ativo Forte",
        message: `${bestSymbol[0]} é seu melhor ativo. Lucro de $${bestSymbol[1].pnl.toFixed(2)} em ${bestSymbol[1].count} trades.`,
      });
    }

    // 5. Análise de Holding Time
    const shortTrades = trades.filter(t => t.duration < 5);
    const longTrades = trades.filter(t => t.duration > 120);
    
    if (shortTrades.length >= 5 && longTrades.length >= 3) {
      const shortPnL = shortTrades.reduce((sum, t) => sum + t.netProfit, 0);
      const longPnL = longTrades.reduce((sum, t) => sum + t.netProfit, 0);
      
      if (shortPnL < 0 && longPnL > 0) {
        results.push({
          id: "holding-time",
          type: "info",
          icon: <Brain className="h-5 w-5" />,
          title: "Padrão Identificado",
          message: `Scalps (<5min) dão prejuízo ($${shortPnL.toFixed(2)}), mas trades longos (>2h) lucram ($${longPnL.toFixed(2)}). Considere segurar mais.`,
        });
      } else if (shortPnL > 0 && longPnL < 0) {
        results.push({
          id: "holding-time",
          type: "info",
          icon: <Brain className="h-5 w-5" />,
          title: "Padrão Identificado",
          message: `Scalps (<5min) lucram ($${shortPnL.toFixed(2)}), mas trades longos (>2h) dão prejuízo ($${longPnL.toFixed(2)}). Foque em operações rápidas.`,
        });
      }
    }

    // 6. Win Rate por direção
    const buyTrades = trades.filter(t => t.type === 'buy');
    const sellTrades = trades.filter(t => t.type === 'sell');
    
    if (buyTrades.length >= 5 && sellTrades.length >= 5) {
      const buyWinRate = (buyTrades.filter(t => t.isWin).length / buyTrades.length) * 100;
      const sellWinRate = (sellTrades.filter(t => t.isWin).length / sellTrades.length) * 100;
      
      if (Math.abs(buyWinRate - sellWinRate) > 20) {
        const better = buyWinRate > sellWinRate ? 'compras' : 'vendas';
        const betterRate = Math.max(buyWinRate, sellWinRate).toFixed(0);
        const worseRate = Math.min(buyWinRate, sellWinRate).toFixed(0);
        
        results.push({
          id: "direction-bias",
          type: "info",
          icon: <TrendingUp className="h-5 w-5" />,
          title: "Viés Direcional",
          message: `Você performa melhor em ${better} (${betterRate}% win rate vs ${worseRate}%). Considere focar nessa direção.`,
        });
      }
    }

    return results.slice(0, 6); // Limitar a 6 insights
  }, [trades]);

  const getTypeStyles = (type: Insight["type"]) => {
    switch (type) {
      case "danger":
        return "bg-danger/10 border-danger/30 text-danger";
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning";
      case "success":
        return "bg-success/10 border-success/30 text-success";
      default:
        return "bg-primary/10 border-primary/30 text-primary";
    }
  };

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Auto-Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${getTypeStyles(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{insight.icon}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs mt-1 opacity-90">{insight.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
