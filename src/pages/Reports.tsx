import { Sidebar } from "@/components/Sidebar";
import { PerformanceCharts } from "@/components/PerformanceCharts";
import { EquityCurve } from "@/components/EquityCurve";
import { useTrades } from "@/hooks/useTrades";
import { calculateMetrics } from "@/lib/parseTradeReport";
import { TrendingUp, TrendingDown, Calendar, Clock, Target, Award, DollarSign, BarChart3 } from "lucide-react";
import { useMemo } from "react";

const Reports = () => {
  const { trades, isLoading } = useTrades();
  const metrics = calculateMetrics(trades);

  const additionalMetrics = useMemo(() => {
    if (trades.length === 0) return null;

    const durations = trades.map(t => t.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    
    const winningTrades = trades.filter(t => t.isWin);
    const losingTrades = trades.filter(t => !t.isWin);
    
    const consecutiveWins = trades.reduce((max, trade, i) => {
      let count = 0;
      for (let j = i; j < trades.length && trades[j].isWin; j++) count++;
      return Math.max(max, count);
    }, 0);
    
    const consecutiveLosses = trades.reduce((max, trade, i) => {
      let count = 0;
      for (let j = i; j < trades.length && !trades[j].isWin; j++) count++;
      return Math.max(max, count);
    }, 0);

    const totalCommission = trades.reduce((sum, t) => sum + (t.commission || 0), 0);
    const totalSwap = trades.reduce((sum, t) => sum + (t.swap || 0), 0);

    return {
      avgDuration: avgDuration / 60, // em minutos
      consecutiveWins,
      consecutiveLosses,
      totalCommission,
      totalSwap,
      largestLoss: Math.min(...trades.map(t => t.netProfit)),
    };
  }, [trades]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios Avançados</h1>
            <p className="text-muted-foreground">
              Análises detalhadas de performance e insights
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Carregando...</div>
          ) : trades.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Ainda não há operações. Importe seu primeiro relatório no Dashboard.</p>
            </div>
          ) : (
            <div className="space-y-6">
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
                    <h4 className="text-sm text-muted-foreground">Expectativa por Operação</h4>
                  </div>
                  <p className={`text-2xl font-bold ${metrics.expectancy >= 0 ? 'text-success' : 'text-danger'}`}>
                    ${metrics.expectancy.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Média esperada</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <h4 className="text-sm text-muted-foreground">Duração Média</h4>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {additionalMetrics?.avgDuration.toFixed(0)} min
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Tempo por operação</p>
                </div>
              </div>

              {/* Curva de Equity */}
              <EquityCurve trades={trades} />

              {/* Performance Charts */}
              <PerformanceCharts trades={trades} />

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
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;
