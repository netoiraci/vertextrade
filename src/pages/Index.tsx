import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FileUpload } from "@/components/FileUpload";
import { parseTradeReport, calculateMetrics } from "@/lib/parseTradeReport";
import { useTrades } from "@/hooks/useTrades";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { MiniAreaChart } from "@/components/dashboard/MiniAreaChart";
import { BiggestTradesBar } from "@/components/dashboard/BiggestTradesBar";
import { CumulativePnLChart } from "@/components/dashboard/CumulativePnLChart";
import { MonthlyPnLChart } from "@/components/dashboard/MonthlyPnLChart";
import { DailyPnLChart } from "@/components/dashboard/DailyPnLChart";
import { TradingHeatmap } from "@/components/dashboard/TradingHeatmap";
import { HoldingTimeDistribution } from "@/components/dashboard/HoldingTimeDistribution";
import { StreakBadge } from "@/components/dashboard/StreakBadge";

const INITIAL_BALANCE = 100000;

const Index = () => {
  const { trades, saveTrades, deleteAllTrades, isLoading, isSaving, isDeleting } = useTrades();
  const [showUpload, setShowUpload] = useState(false);

  const handleFileUpload = (content: string) => {
    const parsedTrades = parseTradeReport(content);
    if (parsedTrades.length > 0) {
      saveTrades(parsedTrades);
      setShowUpload(false);
    }
  };

  const metrics = calculateMetrics(trades);
  
  // Current balance usa netPnL (valor líquido após fees)
  const currentBalance = trades.length > 0 
    ? INITIAL_BALANCE + metrics.netPnL 
    : INITIAL_BALANCE;

  // Calculate drawdown data
  const drawdownData = trades.length > 0 ? (() => {
    const sorted = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
    let cumulative = 0;
    let peak = 0;
    const data: number[] = [];
    sorted.forEach(t => {
      cumulative += t.netProfit;
      if (cumulative > peak) peak = cumulative;
      data.push(cumulative - peak);
    });
    return data;
  })() : [];

  const maxDrawdown = drawdownData.length > 0 ? Math.min(...drawdownData) : 0;

  // Find biggest win and loss
  const biggestWin = trades.length > 0 ? Math.max(...trades.map(t => t.netProfit)) : 0;
  const biggestLoss = trades.length > 0 ? Math.min(...trades.map(t => t.netProfit)) : 0;

  // Avg win/loss ratio já calculado em metrics
  const avgWinLossRatio = metrics.avgLoss > 0 ? metrics.avgWin / metrics.avgLoss : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-primary font-bold">|</span>
              <h1 className="text-xl font-semibold text-foreground">Overview Dashboard</h1>
              {trades.length > 0 && <StreakBadge trades={trades} />}
            </div>
            <div className="flex gap-2">
              {trades.length > 0 && (
                <>
                  <Button onClick={() => setShowUpload(true)} variant="outline" size="sm" disabled={isSaving}>
                    Importar Relatório
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso irá excluir permanentemente todas as {trades.length} operações.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAllTrades()}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </div>

          {trades.length === 0 || showUpload ? (
            <div>
              <FileUpload onFileUpload={handleFileUpload} />
              {showUpload && trades.length > 0 && (
                <Button 
                  onClick={() => setShowUpload(false)} 
                  variant="ghost" 
                  className="mt-4 w-full"
                >
                  Cancelar
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Total Trades" value={metrics.totalTrades} tooltip="Total de operações realizadas">
                  <DonutChart wins={metrics.totalWins} losses={metrics.totalLosses} />
                </StatCard>

                <StatCard 
                  title="Win Rate" 
                  value={`${metrics.winRate.toFixed(2)}%`} 
                  tooltip="Porcentagem de trades vencedores"
                >
                  <DonutChart wins={metrics.totalWins} losses={metrics.totalLosses} />
                </StatCard>

                <StatCard 
                  title="Net P&L" 
                  value={`$${metrics.netPnL.toFixed(2)}`}
                  subtitle={`↓ Fees: $${Math.abs(metrics.totalFees).toFixed(2)}`}
                  tooltip="Lucro/Prejuízo líquido total (após fees)"
                  className={metrics.netPnL >= 0 ? '' : ''}
                >
                  <MiniAreaChart 
                    data={drawdownData.length > 0 ? drawdownData : [0]} 
                    color={metrics.netPnL >= 0 ? 'hsl(var(--success))' : 'hsl(var(--danger))'}
                  />
                </StatCard>

                <StatCard 
                  title="Avg W/L $" 
                  value={avgWinLossRatio.toFixed(2)}
                  tooltip="Relação média entre ganho e perda"
                >
                  <ProgressBar leftValue={metrics.avgWin} rightValue={metrics.avgLoss} />
                </StatCard>

                <StatCard 
                  title="Current Balance" 
                  value={`$${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  tooltip="Saldo atual da conta"
                  className={metrics.netPnL >= 0 ? 'border-success/30' : 'border-danger/30'}
                >
                  <div className={`w-full h-2 rounded-full ${metrics.netPnL >= 0 ? 'bg-success' : 'bg-danger'}`} />
                </StatCard>

                <StatCard 
                  title="Profit Factor" 
                  value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
                  tooltip="Razão entre lucros e perdas totais"
                >
                  <ProgressBar 
                    leftValue={metrics.avgWin * metrics.totalWins} 
                    rightValue={metrics.avgLoss * metrics.totalLosses} 
                  />
                </StatCard>
              </div>

              {/* Second Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Max Drawdown" 
                  value={`$${Math.abs(maxDrawdown).toFixed(2)}`}
                  tooltip="Maior perda acumulada do pico"
                >
                  <MiniAreaChart data={drawdownData.length > 0 ? drawdownData : [0]} />
                </StatCard>

                <StatCard 
                  title="Biggest Trades" 
                  value=""
                  tooltip="Maior ganho e maior perda"
                >
                  <BiggestTradesBar winAmount={biggestWin} lossAmount={biggestLoss} />
                </StatCard>

                <StatCard 
                  title="Expectancy" 
                  value={`$${metrics.expectancy.toFixed(2)}`}
                  subtitle="por trade"
                  tooltip="Expectativa matemática por operação"
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <CumulativePnLChart trades={trades} initialBalance={INITIAL_BALANCE} />
                </div>
                <div className="space-y-4">
                  <MonthlyPnLChart trades={trades} />
                  <DailyPnLChart trades={trades} />
                </div>
              </div>

              {/* Analysis Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TradingHeatmap trades={trades} />
                <HoldingTimeDistribution trades={trades} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
