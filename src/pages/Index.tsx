import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FileUpload } from "@/components/FileUpload";
import { MetricCard } from "@/components/MetricCard";
import { EquityCurve } from "@/components/EquityCurve";
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
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
              <h1 className="text-3xl font-bold text-foreground mb-2">Trading Dashboard</h1>
              <p className="text-muted-foreground">
                {trades.length > 0 ? `Analyzing ${trades.length} trades` : 'Upload your MT4/FTMO report to start'}
              </p>
            </div>
            <div className="flex gap-2">
              {trades.length > 0 && (
                <>
                  <Button onClick={() => setShowUpload(true)} variant="outline" disabled={isSaving}>
                    Import New Report
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={isDeleting}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {trades.length} trades from the database. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAllTrades()}>
                          Delete All Trades
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
                  Cancel
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <MetricCard
                  title="Total Trades"
                  value={metrics.totalTrades}
                  icon={Activity}
                  delay={0}
                />
                <MetricCard
                  title="Win Rate"
                  value={`${metrics.winRate.toFixed(1)}%`}
                  subtitle={`${metrics.totalWins}W / ${metrics.totalLosses}L`}
                  icon={Target}
                  trend={metrics.winRate >= 50 ? "up" : "down"}
                  delay={0.1}
                />
                <MetricCard
                  title="Profit Factor"
                  value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
                  icon={Award}
                  trend={metrics.profitFactor >= 1.5 ? "up" : "down"}
                  delay={0.2}
                />
                <MetricCard
                  title="Total P&L"
                  value={`$${metrics.totalPnL.toFixed(2)}`}
                  icon={DollarSign}
                  trend={metrics.totalPnL >= 0 ? "up" : "down"}
                  delay={0.3}
                />
                <MetricCard
                  title="Expectancy"
                  value={`$${metrics.expectancy.toFixed(2)}`}
                  subtitle="per trade"
                  icon={TrendingUp}
                  trend={metrics.expectancy >= 0 ? "up" : "down"}
                  delay={0.4}
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-6">
                <EquityCurve trades={trades} />
                <TradesTable trades={trades} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
