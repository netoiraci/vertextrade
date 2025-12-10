import { createContext, useContext, ReactNode, useMemo } from "react";
import { Trade, calculateMetrics } from "@/lib/parseTradeReport";
import { useTrades } from "@/hooks/useTrades";
import { useUserSettings, UserSettings } from "@/hooks/useUserSettings";

interface TradeContextType {
  trades: Trade[];
  metrics: ReturnType<typeof calculateMetrics>;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isLoading: boolean;
  saveTrades: (trades: Trade[]) => void;
  deleteAllTrades: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  currentBalance: number;
  todayPnL: number;
  maxDrawdown: number;
  isSettingsLoading: boolean;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const { trades, saveTrades, deleteAllTrades, isLoading, isSaving, isDeleting } = useTrades();
  const { settings, saveSettings, isLoading: isSettingsLoading } = useUserSettings();

  const metrics = useMemo(() => calculateMetrics(trades), [trades]);

  const currentBalance = useMemo(() => {
    return trades.length > 0 ? settings.initialBalance + metrics.netPnL : settings.initialBalance;
  }, [trades, settings.initialBalance, metrics.netPnL]);

  const todayPnL = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return trades
      .filter(t => {
        const tradeDate = new Date(t.closeTime);
        tradeDate.setHours(0, 0, 0, 0);
        return tradeDate.getTime() === today.getTime();
      })
      .reduce((sum, t) => sum + t.netProfit, 0);
  }, [trades]);

  const maxDrawdown = useMemo(() => {
    if (trades.length === 0) return 0;
    
    const sorted = [...trades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
    let cumulative = 0;
    let peak = 0;
    let maxDD = 0;
    
    sorted.forEach(t => {
      cumulative += t.netProfit;
      if (cumulative > peak) peak = cumulative;
      const dd = cumulative - peak;
      if (dd < maxDD) maxDD = dd;
    });
    
    return Math.abs(maxDD);
  }, [trades]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    saveSettings(newSettings);
  };

  return (
    <TradeContext.Provider
      value={{
        trades,
        metrics,
        settings,
        updateSettings,
        isLoading,
        saveTrades,
        deleteAllTrades,
        isSaving,
        isDeleting,
        currentBalance,
        todayPnL,
        maxDrawdown,
        isSettingsLoading,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTradeContext() {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error("useTradeContext must be used within a TradeProvider");
  }
  return context;
}
