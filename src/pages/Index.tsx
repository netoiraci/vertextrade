import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FileUpload } from "@/components/FileUpload";
import { MetricCard } from "@/components/MetricCard";
import { EquityCurve } from "@/components/EquityCurve";
import { DrawdownChart } from "@/components/DrawdownChart";
import { TradesTable } from "@/components/TradesTable";
import { parseTradeReport, calculateMetrics } from "@/lib/parseTradeReport";
import { useTrades } from "@/hooks/useTrades";
import { TrendingUp, Target, DollarSign, Activity, Award, Trash2 } from "lucide-react";
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

const INITIAL_BALANCE = 10000;

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
  
  // Calculate current balance based on sorted trades
  const currentBalance = trades.length > 0 
    ? INITIAL_BALANCE + metrics.totalPnL 
    : INITIAL_BALANCE;

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
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Painel de Trading</h1>
              <p className="text-muted-foreground">
                {trades.length > 0 ? `Analisando ${trades.length} operações` : 'Importe seu relatório MT4/FTMO para começar'}
              </p>
            </div>
            <div className="flex gap-2">
              {trades.length > 0 && (
                <>
                  <Button onClick={() => setShowUpload(true)} variant="outline" disabled={isSaving}>
                    Importar Novo Relatório
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Tudo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso irá excluir permanentemente todas as {trades.length} operações do banco de dados. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAllTrades()}>
                          Excluir Todas as Operações
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
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
                <MetricCard
                  title="Saldo Inicial"
                  value={`$${INITIAL_BALANCE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  icon={DollarSign}
                  delay={0}
                />
                <MetricCard
                  title="Saldo Atual"
                  value={`$${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  icon={DollarSign}
                  trend={metrics.totalPnL >= 0 ? "up" : "down"}
                  delay={0.05}
                />
                <MetricCard
                  title="Operações"
                  value={metrics.totalTrades}
                  icon={Activity}
                  delay={0.1}
                />
                <MetricCard
                  title="Win Rate"
                  value={`${metrics.winRate.toFixed(1)}%`}
                  subtitle={`${metrics.totalWins}G / ${metrics.totalLosses}P`}
                  icon={Target}
                  trend={metrics.winRate >= 50 ? "up" : "down"}
                  delay={0.15}
                />
                <MetricCard
                  title="Profit Factor"
                  value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
                  icon={Award}
                  trend={metrics.profitFactor >= 1.5 ? "up" : "down"}
                  delay={0.2}
                />
                <MetricCard
                  title="P&L Total"
                  value={`$${metrics.totalPnL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  icon={DollarSign}
                  trend={metrics.totalPnL >= 0 ? "up" : "down"}
                  delay={0.25}
                />
                <MetricCard
                  title="Expectativa"
                  value={`$${metrics.expectancy.toFixed(2)}`}
                  subtitle="por trade"
                  icon={TrendingUp}
                  trend={metrics.expectancy >= 0 ? "up" : "down"}
                  delay={0.3}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EquityCurve trades={trades} initialBalance={INITIAL_BALANCE} />
                <DrawdownChart trades={trades} initialBalance={INITIAL_BALANCE} />
              </div>
              
              <TradesTable trades={trades} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
