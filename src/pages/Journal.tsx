import { Sidebar } from "@/components/Sidebar";
import { useTrades } from "@/hooks/useTrades";
import { useState, useEffect, useRef } from "react";
import { useTradingAccounts } from "@/hooks/useTradingAccounts";
import { ActiveAccountBanner } from "@/components/ActiveAccountBanner";
import { Trade } from "@/lib/parseTradeReport";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  JournalHeader,
  TradingJournalTable,
  TradeJourneyChart,
  TradeStats,
} from "@/components/journal";

const Journal = () => {
  const { trades, isLoading } = useTrades();
  const { activeAccountId } = useTradingAccounts();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [pinnedTrades, setPinnedTrades] = useState<Set<string>>(new Set());
  const [isChartLoading, setIsChartLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Reset state when switching accounts
  useEffect(() => {
    setSelectedTrade(null);
    setPinnedTrades(new Set());
  }, [activeAccountId]);

  // Auto-select first pinned trade or first trade on load
  useEffect(() => {
    if (!selectedTrade && trades.length > 0) {
      const firstPinned = trades.find((t) => pinnedTrades.has(t.ticket));
      setSelectedTrade(firstPinned || trades[0]);
    }
  }, [trades, pinnedTrades, selectedTrade]);

  const handleTogglePin = (ticketId: string) => {
    setPinnedTrades((prev) => {
      const newPinned = new Set(prev);
      if (newPinned.has(ticketId)) {
        newPinned.delete(ticketId);
      } else {
        newPinned.add(ticketId);
      }
      return newPinned;
    });
  };

  const handleTradeSelect = (trade: Trade) => {
    setIsChartLoading(true);
    setTimeout(() => {
      setSelectedTrade(trade);
      setIsChartLoading(false);
    }, 150);

    // Smooth scroll to chart on mobile
    if (window.innerWidth < 1024 && chartRef.current) {
      setTimeout(() => {
        chartRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 200);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-6 max-w-[1800px] mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Trading Journal
                </h1>
                <p className="text-muted-foreground">
                  Histórico completo de todas as {trades.length} operações
                </p>
              </div>
              <ActiveAccountBanner />
            </div>

            {!isLoading && trades.length > 0 && <JournalHeader trades={trades} />}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Carregando trades...</p>
              </div>
            </div>
          ) : trades.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum trade ainda. Importe seu primeiro relatório no Dashboard.
              </p>
            </div>
          ) : (
            <>
              <Separator />

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Trading Table */}
                <div className="lg:col-span-3">
                  <TradingJournalTable
                    trades={trades}
                    selectedTrade={selectedTrade}
                    onTradeSelect={handleTradeSelect}
                    pinnedTrades={pinnedTrades}
                    onTogglePin={handleTogglePin}
                  />
                </div>

                {/* Right: Trade Journey Visualization */}
                <div ref={chartRef} className="lg:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      Visualização Interativa
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Clique em uma operação para ver a evolução do preço
                    </p>
                  </div>

                  {isChartLoading ? (
                    <Card className="h-[400px] flex items-center justify-center border-border">
                      <CardContent>
                        <div className="flex flex-col items-center gap-4">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                          <p className="text-muted-foreground">Carregando dados do trade...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : selectedTrade ? (
                    <div className="animate-in fade-in duration-500 space-y-4">
                      <TradeStats trade={selectedTrade} />
                      <TradeJourneyChart trade={selectedTrade} />
                    </div>
                  ) : (
                    <TradeJourneyChart trade={null} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Journal;
