import { Sidebar } from "@/components/Sidebar";
import { TradingCalendar } from "@/components/TradingCalendar";
import { useTrades } from "@/hooks/useTrades";

const Calendar = () => {
  const { trades, isLoading } = useTrades();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Trading Calendar</h1>
            <p className="text-muted-foreground">
              Visual calendar view of your trading activity
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : trades.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No trades yet. Import your first report from the Dashboard.</p>
            </div>
          ) : (
            <TradingCalendar trades={trades} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Calendar;
