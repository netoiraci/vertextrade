import { Sidebar } from "@/components/Sidebar";
import { PerformanceCharts } from "@/components/PerformanceCharts";
import { EquityCurve } from "@/components/EquityCurve";
import { useTrades } from "@/hooks/useTrades";
import { calculateMetrics } from "@/lib/parseTradeReport";

const Reports = () => {
  const { trades, isLoading } = useTrades();
  const metrics = calculateMetrics(trades);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Advanced Reports</h1>
            <p className="text-muted-foreground">
              Detailed performance analytics and insights
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : trades.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No trades yet. Import your first report from the Dashboard.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <EquityCurve trades={trades} />
              <PerformanceCharts trades={trades} />
              
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="text-sm text-muted-foreground mb-2">Average Win</h4>
                  <p className="text-2xl font-bold text-success">${metrics.avgWin.toFixed(2)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="text-sm text-muted-foreground mb-2">Average Loss</h4>
                  <p className="text-2xl font-bold text-danger">${metrics.avgLoss.toFixed(2)}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="text-sm text-muted-foreground mb-2">Largest Win</h4>
                  <p className="text-2xl font-bold text-success">${metrics.largestWin.toFixed(2)}</p>
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
