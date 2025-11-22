import { Trade } from "@/lib/parseTradeReport";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradingCalendarProps {
  trades: Trade[];
}

export function TradingCalendar({ trades }: TradingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const dailyPnL = new Map<string, number>();
    
    trades.forEach((trade) => {
      const dateKey = trade.closeTime.toISOString().split('T')[0];
      const current = dailyPnL.get(dateKey) || 0;
      dailyPnL.set(dateKey, current + trade.netProfit);
    });

    return dailyPnL;
  }, [trades]);

  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells before first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const pnl = calendarData.get(dateKey) || 0;
      days.push({ day, pnl, hasData: calendarData.has(dateKey) });
    }
    
    return days;
  }, [currentDate, calendarData]);

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
        
        {monthData.map((dayData, index) => {
          if (!dayData) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }
          
          const { day, pnl, hasData } = dayData;
          const isProfit = pnl > 0;
          const intensity = Math.min(Math.abs(pnl) / 100, 1);
          
          return (
            <div
              key={day}
              className="aspect-square rounded-md p-2 flex flex-col items-center justify-center text-xs transition-all hover:scale-105 cursor-pointer border"
              style={{
                backgroundColor: hasData
                  ? isProfit 
                    ? `rgba(16, 185, 129, ${intensity * 0.3})` 
                    : `rgba(244, 63, 94, ${intensity * 0.3})`
                  : 'transparent',
                borderColor: hasData
                  ? isProfit ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'
                  : 'hsl(var(--border))',
              }}
              title={hasData ? `${day}: $${pnl.toFixed(2)}` : `${day}`}
            >
              <div className="font-medium">{day}</div>
              {hasData && (
                <div className={`text-xs ${isProfit ? 'text-success' : 'text-danger'}`}>
                  ${pnl.toFixed(0)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
