import { Sidebar } from "@/components/Sidebar";
import { EquityCurve } from "@/components/EquityCurve";
import { DrawdownChart } from "@/components/DrawdownChart";
import { RiskMetrics } from "@/components/RiskMetrics";
import { useTrades } from "@/hooks/useTrades";
import { calculateMetrics } from "@/lib/parseTradeReport";
import { TimeRangeChart } from "@/components/performance/TimeRangeChart";
import { WeekdayChart } from "@/components/performance/WeekdayChart";
import { BestWorstTrades } from "@/components/performance/BestWorstTrades";
import { HoldingTimeChart } from "@/components/performance/HoldingTimeChart";
import { RecentTradesWidget } from "@/components/performance/RecentTradesWidget";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Award, DollarSign, BarChart3, Timer } from "lucide-react";
import { useMemo } from "react";

const INITIAL_BALANCE = 100000;

const Reports = () => {
  const { trades, isLoading } = useTrades();
  const metrics = calculateMetrics(trades);

  const additionalMetrics = useMemo(() => {
    if (trades.length === 0) return null;

    const durations = trades.map(t => t.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    // IMPORTANTE: Ordenar trades por data de fechamento (mais antigo primeiro)
    const sortedTrades = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
    
    // Calcular sequências consecutivas corretamente
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    sortedTrades.forEach((trade) => {
      if (trade.isWin) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      }
    });

    const totalCommission = trades.reduce((sum, t) => sum + (t.commission || 0), 0);
    const totalSwap = trades.reduce((sum, t) => sum + (t.swap || 0), 0);

    return {
      avgDuration: avgDuration / 60, // converter de minutos para horas
      consecutiveWins: maxConsecutiveWins,
      consecutiveLosses: maxConsecutiveLosses,
      totalCommission,
      totalSwap,
      largestLoss: Math.min(...trades.map(t => t.netProfit)),
    };
  }, [trades]);

  const bestTimeRange = useMemo(() => {
    if (trades.length === 0) return { label: 'N/A', pnl: 0 };
    
    const timeRanges = [
      { label: '9-10 AM', start: 9, end: 10 },
      { label: '11-12 PM', start: 11, end: 12 },
      { label: '1-2 PM', start: 13, end: 14 },
      { label: '3-4 PM', start: 15, end: 16 },
      { label: '5-6 PM', start: 17, end: 18 },
      { label: '7-8 PM', start: 19, end: 20 },
    ];
    
    return timeRanges
      .map(range => ({
        ...range,
        pnl: trades.filter(t => {
          const hour = t.openTime.getHours();
          return hour >= range.start && hour < range.end;
        }).reduce((sum, t) => sum + t.netProfit, 0)
      }))
      .sort((a, b) => b.pnl - a.pnl)[0];
  }, [trades]);

  const bestWeekday = useMemo(() => {
    if (trades.length === 0) return { day: 'N/A', pnl: 0 };
    
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    return days
      .map((day, index) => ({
        day,
        pnl: trades.filter(t => t.closeTime.getDay() === index)
          .reduce((sum, t) => sum + t.netProfit, 0)
      }))
      .sort((a, b) => b.pnl - a.pnl)[0];
  }, [trades]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Performance</h1>
            <p className="text-muted-foreground">
              Análises detalhadas com insights por horário, dia da semana e tempo de permanência
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Carregando...</div>
          ) : trades.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Ainda não há operações. Importe seu primeiro relatório no Dashboard.</p>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="time">Por Horário</TabsTrigger>
                <TabsTrigger value="weekday">Por Dia</TabsTrigger>
                <TabsTrigger value="holding">Holding Time</TabsTrigger>
                <TabsTrigger value="trades">Top Trades</TabsTrigger>
              </TabsList>

              {/* Aba: Visão Geral */}
              <TabsContent value="overview" className="space-y-6">
                {/* Métricas de Risco Avançadas */}
                <RiskMetrics trades={trades} initialBalance={INITIAL_BALANCE} />

                {/* Resumo Geral */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Taxa de Acerto</h4>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{metrics.winRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground mt-1">{metrics.totalWins} vitórias / {metrics.totalLosses} perdas</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Fator de Lucro</h4>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Relação ganhos/perdas</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Expectativa</h4>
                    </div>
                    <p className={`text-2xl font-bold ${metrics.expectancy >= 0 ? 'text-success' : 'text-danger'}`}>
                      ${metrics.expectancy.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Por operação</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Duração Média</h4>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {additionalMetrics && additionalMetrics.avgDuration >= 60 
                        ? `${(additionalMetrics.avgDuration / 60).toFixed(1)} h`
                        : `${additionalMetrics?.avgDuration.toFixed(0)} min`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Tempo por operação</p>
                  </div>
                </div>

                {/* Gráficos de Equity e Drawdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <EquityCurve trades={trades} initialBalance={INITIAL_BALANCE} />
                  <DrawdownChart trades={trades} initialBalance={INITIAL_BALANCE} />
                </div>

                {/* Estatísticas Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <h4 className="text-sm text-muted-foreground">Maior Ganho</h4>
                    </div>
                    <p className="text-2xl font-bold text-success">${metrics.largestWin.toFixed(2)}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-danger" />
                      <h4 className="text-sm text-muted-foreground">Maior Perda</h4>
                    </div>
                    <p className="text-2xl font-bold text-danger">${additionalMetrics?.largestLoss.toFixed(2)}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <h4 className="text-sm text-muted-foreground">Ganho Médio</h4>
                    </div>
                    <p className="text-2xl font-bold text-success">${metrics.avgWin.toFixed(2)}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-danger" />
                      <h4 className="text-sm text-muted-foreground">Perda Média</h4>
                    </div>
                    <p className="text-2xl font-bold text-danger">${metrics.avgLoss.toFixed(2)}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Vitórias Consecutivas</h4>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{additionalMetrics?.consecutiveWins}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Perdas Consecutivas</h4>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{additionalMetrics?.consecutiveLosses}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm text-muted-foreground">Total de Comissões</h4>
                    </div>
                    <p className="text-2xl font-bold text-muted-foreground">${additionalMetrics?.totalCommission.toFixed(2)}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm text-muted-foreground">Total de Swap</h4>
                    </div>
                    <p className="text-2xl font-bold text-muted-foreground">${additionalMetrics?.totalSwap.toFixed(2)}</p>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <h4 className="text-sm text-muted-foreground">Total de Operações</h4>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{metrics.totalTrades}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Análise por Horário */}
              <TabsContent value="time" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TimeRangeChart trades={trades} />
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Insights por Horário</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Melhor Horário</p>
                            <p className="text-muted-foreground">
                              {bestTimeRange.label} com ${bestTimeRange.pnl.toFixed(2)} de P&L
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Timer className="h-5 w-5 text-accent mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Recomendação</p>
                            <p className="text-muted-foreground">
                              Concentre suas operações nos horários com melhor performance histórica
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <RecentTradesWidget trades={trades} />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Análise por Dia da Semana */}
              <TabsContent value="weekday" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <WeekdayChart trades={trades} />
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Insights por Dia da Semana</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Melhor Dia</p>
                            <p className="text-muted-foreground">
                              {bestWeekday.day} com ${bestWeekday.pnl.toFixed(2)} de P&L
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-accent mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Padrão Identificado</p>
                            <p className="text-muted-foreground">
                              Analise o volume e a volatilidade dos dias com melhor performance
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <RecentTradesWidget trades={trades} />
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Holding Time */}
              <TabsContent value="holding" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <HoldingTimeChart trades={trades} />
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Insights de Holding Time</h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <Timer className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Duração Média</p>
                            <p className="text-muted-foreground">
                              {additionalMetrics && additionalMetrics.avgDuration >= 60 
                                ? `${(additionalMetrics.avgDuration / 60).toFixed(1)} horas por operação`
                                : `${additionalMetrics?.avgDuration.toFixed(0)} minutos por operação`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <BarChart3 className="h-5 w-5 text-accent mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Otimização</p>
                            <p className="text-muted-foreground">
                              Identifique o tempo de permanência ideal para seu estilo de trading
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-4">Estatísticas de Tempo</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Operações rápidas (&lt;5min)</span>
                          <span className="text-sm font-semibold text-foreground">
                            {trades.filter(t => t.duration < 300).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Operações médias (5-30min)</span>
                          <span className="text-sm font-semibold text-foreground">
                            {trades.filter(t => t.duration >= 300 && t.duration < 1800).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Operações longas (&gt;30min)</span>
                          <span className="text-sm font-semibold text-foreground">
                            {trades.filter(t => t.duration >= 1800).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Melhores e Piores Trades */}
              <TabsContent value="trades" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BestWorstTrades trades={trades} type="best" />
                  <BestWorstTrades trades={trades} type="worst" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Análise de Extremos</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Maior Ganho</span>
                          <span className="text-lg font-bold text-success">${metrics.largestWin.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Maior Perda</span>
                          <span className="text-lg font-bold text-danger">${additionalMetrics?.largestLoss.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          A relação entre seus melhores e piores trades indica o nível de risco que você está assumindo.
                        </p>
                      </div>
                    </div>
                  </div>
                  <RecentTradesWidget trades={trades} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
