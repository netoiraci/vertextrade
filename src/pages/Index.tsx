import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { FileUpload } from "@/components/FileUpload";
import { MetricCard } from "@/components/MetricCard";
import { EquityCurve } from "@/components/EquityCurve";
import { TradesTable } from "@/components/TradesTable";
import { parseTradeReport, calculateMetrics, Trade } from "@/lib/parseTradeReport";
import { TrendingUp, Target, DollarSign, Activity, Award } from "lucide-react";

const Index = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  const handleFileUpload = (content: string) => {
    const parsedTrades = parseTradeReport(content);
    setTrades(parsedTrades);
  };

  const metrics = calculateMetrics(trades);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Trading Dashboard</h1>
            <p className="text-muted-foreground">
              Upload your MT4/FTMO report to analyze your trading performance
            </p>
          </div>

          {trades.length === 0 ? (
            <FileUpload onFileUpload={handleFileUpload} />
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
