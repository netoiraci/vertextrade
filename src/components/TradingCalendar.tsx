import { Trade } from "@/lib/parseTradeReport";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TradingCalendarProps {
  trades: Trade[];
}

export function TradingCalendar({ trades }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const dailyData = new Map<string, { pnl: number; count: number }>();
    
    trades.forEach((trade) => {
      const dateKey = trade.closeTime.toISOString().split('T')[0];
      const current = dailyData.get(dateKey) || { pnl: 0, count: 0 };
      dailyData.set(dateKey, { 
        pnl: current.pnl + trade.netProfit, 
        count: current.count + 1 
      });
    });

    return dailyData;
  }, [trades]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
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
        hasData: !!data 
      });
    }
    
    return days;
  }, [currentDate, calendarData]);

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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex gap-2">
            <Select
              value={String(currentDate.getMonth())}
              onValueChange={(value) => setCurrentDate(new Date(currentDate.getFullYear(), parseInt(value), 1))}
            >
              <SelectTrigger className="w-32 bg-secondary border-0">
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
              <SelectTrigger className="w-24 bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="ml-4 px-4 py-2 rounded-lg bg-secondary">
            <span className="text-sm text-muted-foreground">Total: </span>
            <span className={`text-sm font-semibold ${monthTotal >= 0 ? 'text-success' : 'text-danger'}`}>
              ${monthTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-8 gap-1">
        {/* Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Total'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {monthData.map((dayData, index) => {
          // Calculate weekly totals
          const weekIndex = Math.floor(index / 7);
          const isLastInRow = (index + 1) % 7 === 0 || index === monthData.length - 1;
          
          if (!dayData) {
            return (
              <div 
                key={`empty-${index}`} 
                className="aspect-[4/3] bg-secondary/30 rounded-md"
              />
            );
          }
          
          const { day, pnl, count, hasData } = dayData;
          const isProfit = pnl > 0;
          
          return (
            <div
              key={day}
              className={`aspect-[4/3] rounded-md p-2 flex flex-col justify-between transition-all hover:scale-[1.02] cursor-pointer ${
                hasData 
                  ? isProfit 
                    ? 'bg-success/20 border border-success/30' 
                    : 'bg-danger/20 border border-danger/30'
                  : 'bg-secondary/30'
              }`}
            >
              <div className="text-xs text-muted-foreground text-right">{day}</div>
              {hasData && (
                <div className="text-right">
                  <p className={`text-sm font-semibold ${isProfit ? 'text-success' : 'text-danger'}`}>
                    ${pnl.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">{count} Trade{count > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          );
        })}
        
        {/* Fill remaining cells to complete the grid */}
        {Array.from({ length: (8 - ((monthData.length % 7) || 7)) % 7 }).map((_, i) => (
          <div key={`fill-${i}`} className="aspect-[4/3] bg-secondary/30 rounded-md" />
        ))}
        
        {/* Weekly totals column - simplified */}
        {Array.from({ length: Math.ceil(monthData.length / 7) }).map((_, weekIndex) => {
          const weekStart = weekIndex * 7;
          const weekDays = monthData.slice(weekStart, weekStart + 7).filter(Boolean);
          const weekTotal = weekDays.reduce((sum, d) => sum + (d?.pnl || 0), 0);
          const hasWeekData = weekDays.some(d => d?.hasData);
          
          return (
            <div
              key={`week-${weekIndex}`}
              className={`aspect-[4/3] rounded-md p-2 flex items-center justify-center ${
                hasWeekData 
                  ? weekTotal >= 0 
                    ? 'bg-success/10' 
                    : 'bg-danger/10'
                  : 'bg-secondary/20'
              }`}
            >
              {hasWeekData && (
                <span className={`text-sm font-semibold ${weekTotal >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${weekTotal.toFixed(2)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
