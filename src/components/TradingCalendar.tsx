import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";

interface TradingCalendarProps {
  trades: Trade[];
}

export function TradingCalendar({ trades }: TradingCalendarProps) {
  const calendarData = useMemo(() => {
    const dailyPnL = new Map<string, number>();
    
    trades.forEach((trade) => {
      const dateKey = trade.closeTime.toLocaleDateString('pt-BR');
      const current = dailyPnL.get(dateKey) || 0;
      dailyPnL.set(dateKey, current + trade.netProfit);
    });

    return dailyPnL;
  }, [trades]);

  const sortedDates = useMemo(() => {
    return Array.from(calendarData.entries())
      .sort((a, b) => {
        const dateA = new Date(a[0].split('/').reverse().join('-'));
        const dateB = new Date(b[0].split('/').reverse().join('-'));
        return dateB.getTime() - dateA.getTime();
      });
  }, [calendarData]);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Trading Calendar</h3>
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
        {sortedDates.map(([date, pnl]) => {
          const isProfit = pnl > 0;
          const intensity = Math.min(Math.abs(pnl) / 100, 1);
          
          return (
            <div
              key={date}
              className="aspect-square rounded-md p-2 flex flex-col items-center justify-center text-xs transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: isProfit 
                  ? `rgba(16, 185, 129, ${intensity * 0.3})` 
                  : `rgba(244, 63, 94, ${intensity * 0.3})`,
                borderWidth: '1px',
                borderColor: isProfit ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)',
              }}
              title={`${date}: $${pnl.toFixed(2)}`}
            >
              <div className="font-medium">{date.split('/')[0]}</div>
              <div className={`text-xs ${isProfit ? 'text-success' : 'text-danger'}`}>
                ${pnl.toFixed(0)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
