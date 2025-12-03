import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TradingHeatmapProps {
  trades: Trade[];
}

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 08:00 to 18:00

export function TradingHeatmap({ trades }: TradingHeatmapProps) {
  const heatmapData = useMemo(() => {
    const data: { [key: string]: { pnl: number; count: number } } = {};
    
    // Initialize all cells
    WEEKDAYS.forEach((_, dayIndex) => {
      HOURS.forEach(hour => {
        data[`${dayIndex}-${hour}`] = { pnl: 0, count: 0 };
      });
    });
    
    // Aggregate trades by weekday and hour
    trades.forEach(trade => {
      const day = trade.openTime.getDay();
      // Convert Sunday=0 to Monday=0 format, skip weekends
      if (day === 0 || day === 6) return;
      const weekdayIndex = day - 1; // Monday = 0
      
      const hour = trade.openTime.getHours();
      if (hour < 8 || hour > 18) return;
      
      const key = `${weekdayIndex}-${hour}`;
      if (data[key]) {
        data[key].pnl += trade.netProfit;
        data[key].count += 1;
      }
    });
    
    return data;
  }, [trades]);

  // Calculate min/max for color scaling
  const { minPnL, maxPnL } = useMemo(() => {
    const values = Object.values(heatmapData).map(d => d.pnl).filter(v => v !== 0);
    return {
      minPnL: Math.min(...values, 0),
      maxPnL: Math.max(...values, 0)
    };
  }, [heatmapData]);

  const getColor = (pnl: number, count: number) => {
    if (count === 0) return 'bg-secondary';
    
    if (pnl > 0) {
      const intensity = maxPnL > 0 ? pnl / maxPnL : 0;
      if (intensity > 0.7) return 'bg-success shadow-[0_0_12px_hsl(var(--success)/0.5)]';
      if (intensity > 0.3) return 'bg-success/70';
      return 'bg-success/40';
    } else {
      const intensity = minPnL < 0 ? pnl / minPnL : 0;
      if (intensity > 0.7) return 'bg-danger shadow-[0_0_12px_hsl(var(--danger)/0.5)]';
      if (intensity > 0.3) return 'bg-danger/70';
      return 'bg-danger/40';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-primary font-bold">|</span>
        <h3 className="text-sm font-semibold text-foreground">Mapa de Calor - Performance</h3>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* Hours header */}
          <div className="flex mb-1">
            <div className="w-16 shrink-0" />
            {HOURS.map(hour => (
              <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground">
                {hour}h
              </div>
            ))}
          </div>
          
          {/* Grid */}
          <TooltipProvider>
            {WEEKDAYS.map((day, dayIndex) => (
              <div key={day} className="flex gap-1 mb-1">
                <div className="w-16 shrink-0 text-xs text-muted-foreground flex items-center">
                  {day}
                </div>
                {HOURS.map(hour => {
                  const key = `${dayIndex}-${hour}`;
                  const cell = heatmapData[key];
                  
                  return (
                    <Tooltip key={hour}>
                      <TooltipTrigger asChild>
                        <div 
                          className={`flex-1 h-8 rounded transition-all cursor-pointer hover:scale-105 ${getColor(cell.pnl, cell.count)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="bg-popover border border-border">
                        <p className="text-xs font-medium">{day} às {hour}h</p>
                        <p className={`text-sm font-bold ${cell.pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                          {cell.pnl >= 0 ? '+' : ''}${cell.pnl.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{cell.count} trade{cell.count !== 1 ? 's' : ''}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </TooltipProvider>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-danger shadow-[0_0_8px_hsl(var(--danger)/0.5)]" />
              <span>Prejuízo Alto</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-secondary" />
              <span>Sem Trades</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]" />
              <span>Lucro Alto</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
