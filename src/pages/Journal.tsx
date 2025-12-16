import { Sidebar } from "@/components/Sidebar";
import { TradesTable } from "@/components/TradesTable";
import { useTrades } from "@/hooks/useTrades";
import { TradeFilters, TradeFiltersState, defaultFilters } from "@/components/TradeFilters";
import { useTradeFilters } from "@/hooks/useTradeFilters";
import { useState, useEffect } from "react";
import { useTradingAccounts } from "@/hooks/useTradingAccounts";
import { ActiveAccountBanner } from "@/components/ActiveAccountBanner";

const Journal = () => {
  const { trades, isLoading } = useTrades();
  const { activeAccountId } = useTradingAccounts();
  const [filters, setFilters] = useState<TradeFiltersState>(defaultFilters);
  const filteredTrades = useTradeFilters(trades, filters);

  // Reset filters when switching accounts
  useEffect(() => {
    setFilters(defaultFilters);
  }, [activeAccountId]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Trading Journal</h1>
              <p className="text-muted-foreground">
                Complete history of all {trades.length} trades
                {filteredTrades.length !== trades.length && ` (showing ${filteredTrades.length})`}
              </p>
            </div>
            <ActiveAccountBanner />
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : trades.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No trades yet. Import your first report from the Dashboard.</p>
            </div>
          ) : (
            <>
              <TradeFilters filters={filters} onFiltersChange={setFilters} />
              <TradesTable trades={filteredTrades} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Journal;
