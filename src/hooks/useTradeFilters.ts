import { useMemo } from "react";
import { Trade } from "@/lib/parseTradeReport";
import { TradeFiltersState } from "@/components/TradeFilters";
import { startOfDay, startOfWeek, startOfMonth, subMonths, isSameDay, getMonth, getYear } from "date-fns";

export function useTradeFilters(trades: Trade[], filters: TradeFiltersState) {
  return useMemo(() => {
    let filtered = [...trades];
    const now = new Date();

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((trade) =>
        trade.symbol.toLowerCase().includes(searchLower)
      );
    }

    // Specific date filter (takes priority over time period)
    if (filters.specificDate) {
      filtered = filtered.filter((trade) => 
        isSameDay(trade.closeTime, filters.specificDate!)
      );
    } 
    // Month and Year filter (takes priority over time period)
    else if (filters.selectedMonth !== "all" || filters.selectedYear !== "all") {
      filtered = filtered.filter((trade) => {
        const tradeMonth = getMonth(trade.closeTime);
        const tradeYear = getYear(trade.closeTime);
        
        const monthMatch = filters.selectedMonth === "all" || tradeMonth === parseInt(filters.selectedMonth);
        const yearMatch = filters.selectedYear === "all" || tradeYear === parseInt(filters.selectedYear);
        
        return monthMatch && yearMatch;
      });
    }
    // Time period filter
    else if (filters.timePeriod !== "all") {
      let startDate: Date;
      switch (filters.timePeriod) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "week":
          startDate = startOfWeek(now, { weekStartsOn: 1 });
          break;
        case "month":
          startDate = startOfMonth(now);
          break;
        case "3months":
          startDate = subMonths(now, 3);
          break;
        default:
          startDate = new Date(0);
      }
      filtered = filtered.filter((trade) => trade.closeTime >= startDate);
    }

    // Outcome filter
    if (filters.outcome !== "all") {
      filtered = filtered.filter((trade) => {
        if (filters.outcome === "win") return trade.isWin;
        if (filters.outcome === "loss") return !trade.isWin;
        return true;
      });
    }

    // Side filter
    if (filters.side !== "all") {
      filtered = filtered.filter((trade) => trade.type === filters.side);
    }

    // Duration filter
    if (filters.duration !== "all") {
      filtered = filtered.filter((trade) => {
        const durationMinutes = trade.duration;
        switch (filters.duration) {
          case "scalp":
            return durationMinutes < 5;
          case "short":
            return durationMinutes >= 5 && durationMinutes < 30;
          case "medium":
            return durationMinutes >= 30 && durationMinutes < 120;
          case "long":
            return durationMinutes >= 120;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [trades, filters]);
}
