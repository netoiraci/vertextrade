import { Trade } from "@/lib/parseTradeReport";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";

interface TradingCalendarProps {
  trades: Trade[];
}

interface DayData {
  day: number;
  pnl: number;
  count: number;
  hasData: boolean;
  symbols: string[];
  tickets: string[];
  maxPnl: number;
  minPnl: number;
}

export function TradingCalendar({ trades }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Process trades into daily data with detailed info
  const calendarData = useMemo(() => {
    const dailyData = new Map<string, { 
      pnl: number; 
      count: number; 
      symbols: string[];
      tickets: string[];
    }>();
    
    trades.forEach((trade) => {
      const dateKey = trade.closeTime.toISOString().split('T')[0];
      const current = dailyData.get(dateKey) || { 
        pnl: 0, 
        count: 0, 
        symbols: [],
        tickets: []
      };
      
      dailyData.set(dateKey, { 
        pnl: current.pnl + trade.netProfit, 
        count: current.count + 1,
        symbols: [...current.symbols, trade.symbol],
        tickets: [...current.tickets, trade.ticket]
      });
    });

    return dailyData;
  }, [trades]);

  // Calculate max and min PnL for heatmap intensity
  const { maxPnl, minPnl } = useMemo(() => {
    let max = 0;
    let min = 0;
    calendarData.forEach((data) => {
      if (data.pnl > max) max = data.pnl;
      if (data.pnl < min) min = data.pnl;
    });
    return { maxPnl: max, minPnl: min };
  }, [calendarData]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (DayData | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = calendarData.get(dateKey);
      days.push({ 
        day, 
        pnl: data?.pnl || 0, 
        count: data?.count || 0,
        hasData: !!data,
        symbols: data?.symbols || [],
        tickets: data?.tickets || [],
        maxPnl,
        minPnl
      });
    }
    
    return days;
  }, [currentDate, calendarData, maxPnl, minPnl]);

  const monthTotal = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let total = 0;
    
    calendarData.forEach((data, dateKey) => {
      const date = new Date(dateKey);
      if (date.getFullYear() === year && date.getMonth() === month) {
        total += data.pnl;
      }
    });
    
    return total;
  }, [currentDate, calendarData]);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i);

  // Calculate heatmap intensity based on PnL
  const getHeatmapStyle = (pnl: number, hasData: boolean) => {
    if (!hasData) return {};
    
    const isProfit = pnl > 0;
    let intensity = 0;
    
    if (isProfit && maxPnl > 0) {
      intensity = Math.min(pnl / maxPnl, 1);
    } else if (!isProfit && minPnl < 0) {
      intensity = Math.min(Math.abs(pnl) / Math.abs(minPnl), 1);
    }
    
    // Scale intensity from 0.15 to 0.6 for better visibility
    const scaledIntensity = 0.15 + (intensity * 0.45);
    
    if (isProfit) {
      return {
        backgroundColor: `hsl(var(--success) / ${scaledIntensity})`,
        borderColor: `hsl(var(--success) / ${scaledIntensity + 0.2})`,
        boxShadow: intensity > 0.5 ? `0 0 20px hsl(var(--success) / ${intensity * 0.3})` : 'none'
      };
    } else {
      return {
        backgroundColor: `hsl(var(--danger) / ${scaledIntensity})`,
        borderColor: `hsl(var(--danger) / ${scaledIntensity + 0.2})`,
        boxShadow: intensity > 0.5 ? `0 0 20px hsl(var(--danger) / ${intensity * 0.3})` : 'none'
      };
    }
  };

  // Get unique symbols with counts
  const getSymbolSummary = (symbols: string[]) => {
    const counts = symbols.reduce((acc, symbol) => {
      acc[symbol] = (acc[symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={previousMonth}
              className="hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              <Select
                value={String(currentDate.getMonth())}
                onValueChange={(value) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(value), 1))}
              >
                <SelectTrigger className="w-32 bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={String(index)}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(currentDate.getFullYear())}
                onValueChange={(value) => setCurrentDate(new Date(parseInt(value), currentDate.getMonth(), 1))}
              >
                <SelectTrigger className="w-24 bg-secondary/50 border-border/50 hover:bg-secondary/80 transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={nextMonth}
              className="hover:bg-secondary/80 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <motion.div 
              key={monthTotal}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`ml-4 px-5 py-2.5 rounded-xl border ${
                monthTotal >= 0 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-danger/10 border-danger/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {monthTotal >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
                <span className="text-sm text-muted-foreground">Monthly Total:</span>
                <span className={`text-lg font-bold ${monthTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${monthTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0.2, 0.35, 0.5, 0.65].map((opacity, i) => (
                  <div 
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--success) / ${opacity})` }}
                  />
                ))}
              </div>
              <span>Profit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[0.2, 0.35, 0.5, 0.65].map((opacity, i) => (
                  <div 
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: `hsl(var(--danger) / ${opacity})` }}
                  />
                ))}
              </div>
              <span>Loss</span>
            </div>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-8 gap-2">
          {/* Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Week'].map((day) => (
            <div 
              key={day} 
              className={`text-center text-xs font-semibold py-3 rounded-lg ${
                day === 'Week' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              {day}
            </div>
          ))}
          
          {/* Calendar Days organized by weeks */}
          {(() => {
            const weeks: Array<Array<DayData | null>> = [];
            let currentWeek: Array<DayData | null> = [];
            
            monthData.forEach((dayData) => {
              currentWeek.push(dayData);
              if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
              }
            });
            
            if (currentWeek.length > 0) {
              while (currentWeek.length < 7) {
                currentWeek.push(null);
              }
              weeks.push(currentWeek);
            }
            
            return weeks.map((week, weekIndex) => {
              const weekTotal = week.reduce((sum, d) => sum + (d?.pnl || 0), 0);
              const hasWeekData = week.some(d => d?.hasData);
              
              return (
                <>
                  {/* Week days */}
                  {week.map((dayData, dayIndex) => {
                    if (!dayData) {
                      return (
                        <div 
                          key={`empty-${weekIndex}-${dayIndex}`} 
                          className="aspect-square bg-secondary/20 rounded-lg border border-border/30"
                        />
                      );
                    }
                    
                    const { day, pnl, count, hasData, symbols, tickets } = dayData;
                    const isProfit = pnl > 0;
                    const heatmapStyle = getHeatmapStyle(pnl, hasData);
                    const symbolSummary = getSymbolSummary(symbols);
                    
                    const dayCell = (
                      <motion.div
                        key={`day-${weekIndex}-${day}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: dayIndex * 0.02 }}
                        className={`aspect-square rounded-lg p-2 flex flex-col justify-between transition-all duration-200 cursor-pointer border ${
                          hasData 
                            ? 'hover:scale-105 hover:z-10' 
                            : 'bg-secondary/20 border-border/30 hover:bg-secondary/40'
                        }`}
                        style={hasData ? {
                          ...heatmapStyle,
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        } : undefined}
                      >
                        <div className={`text-xs font-medium ${hasData ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                          {day}
                        </div>
                        {hasData && (
                          <div className="text-right space-y-0.5">
                            <p className={`text-sm font-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                              {isProfit ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {count} trade{count > 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    );

                    if (!hasData) return dayCell;

                    return (
                      <Tooltip key={`day-${weekIndex}-${day}`}>
                        <TooltipTrigger asChild>
                          {dayCell}
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top" 
                          align="center"
                          className="p-0 border-0 bg-transparent"
                          sideOffset={8}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`min-w-[220px] rounded-xl border shadow-2xl backdrop-blur-sm ${
                              isProfit 
                                ? 'bg-card/95 border-success/40' 
                                : 'bg-card/95 border-danger/40'
                            }`}
                          >
                            {/* Header */}
                            <div className={`px-4 py-3 rounded-t-xl border-b ${
                              isProfit 
                                ? 'bg-success/15 border-success/20' 
                                : 'bg-danger/15 border-danger/20'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">
                                  {months[currentDate.getMonth()]} {day}, {currentDate.getFullYear()}
                                </span>
                                {isProfit ? (
                                  <TrendingUp className="h-4 w-4 text-success" />
                                ) : (
                                  <TrendingDown className="h-4 w-4 text-danger" />
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                              {/* Net P&L */}
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Net P&L</p>
                                <p className={`text-2xl font-bold ${isProfit ? 'text-success' : 'text-danger'}`}>
                                  {isProfit ? '+' : ''}{pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </p>
                              </div>

                              {/* Trade Count */}
                              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50">
                                <BarChart3 className="h-4 w-4 text-primary" />
                                <div>
                                  <p className="text-xs text-muted-foreground">Trades Closed</p>
                                  <p className="text-sm font-semibold text-foreground">
                                    {tickets.length} trade{tickets.length > 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>

                              {/* Top Symbols */}
                              {symbolSummary.length > 0 && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                                    Top Pairs Traded
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {symbolSummary.map(([symbol, count]) => (
                                      <span 
                                        key={symbol}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary/15 text-primary border border-primary/20"
                                      >
                                        {symbol}
                                        <span className="text-[10px] text-primary/70">×{count}</span>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  
                  {/* Weekly total */}
                  <motion.div
                    key={`week-total-${weekIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center border transition-all ${
                      hasWeekData 
                        ? weekTotal >= 0 
                          ? 'bg-success/10 border-success/20' 
                          : 'bg-danger/10 border-danger/20'
                        : 'bg-secondary/10 border-border/30'
                    }`}
                  >
                    {hasWeekData && (
                      <>
                        <span className="text-[10px] text-muted-foreground mb-1">Week {weekIndex + 1}</span>
                        <span className={`text-sm font-bold ${weekTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                          {weekTotal >= 0 ? '+' : ''}${Math.abs(weekTotal).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </>
                    )}
                  </motion.div>
                </>
              );
            });
          })()}
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-secondary/30">
              <p className="text-xs text-muted-foreground mb-1">Trading Days</p>
              <p className="text-lg font-bold text-foreground">
                {Array.from(calendarData.entries()).filter(([key]) => {
                  const date = new Date(key);
                  return date.getMonth() === currentDate.getMonth() && 
                         date.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/10">
              <p className="text-xs text-muted-foreground mb-1">Profitable Days</p>
              <p className="text-lg font-bold text-success">
                {Array.from(calendarData.entries()).filter(([key, data]) => {
                  const date = new Date(key);
                  return date.getMonth() === currentDate.getMonth() && 
                         date.getFullYear() === currentDate.getFullYear() &&
                         data.pnl > 0;
                }).length}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-danger/10">
              <p className="text-xs text-muted-foreground mb-1">Loss Days</p>
              <p className="text-lg font-bold text-danger">
                {Array.from(calendarData.entries()).filter(([key, data]) => {
                  const date = new Date(key);
                  return date.getMonth() === currentDate.getMonth() && 
                         date.getFullYear() === currentDate.getFullYear() &&
                         data.pnl < 0;
                }).length}
              </p>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground mb-1">Total Trades</p>
              <p className="text-lg font-bold text-primary">
                {Array.from(calendarData.entries()).reduce((sum, [key, data]) => {
                  const date = new Date(key);
                  if (date.getMonth() === currentDate.getMonth() && 
                      date.getFullYear() === currentDate.getFullYear()) {
                    return sum + data.count;
                  }
                  return sum;
                }, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
