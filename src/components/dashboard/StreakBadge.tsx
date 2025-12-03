import { Trade } from "@/lib/parseTradeReport";
import { useMemo } from "react";
import { Flame, Snowflake } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StreakBadgeProps {
  trades: Trade[];
}

export function StreakBadge({ trades }: StreakBadgeProps) {
  const streak = useMemo(() => {
    if (trades.length === 0) return { type: 'neutral', count: 0 };
    
    // Ordenar trades por data de fechamento (mais recente primeiro)
    const sortedTrades = [...trades].sort((a, b) => b.closeTime.getTime() - a.closeTime.getTime());
    
    const firstTrade = sortedTrades[0];
    const isWinning = firstTrade.isWin;
    let count = 0;
    
    for (const trade of sortedTrades) {
      if (trade.isWin === isWinning) {
        count++;
      } else {
        break;
      }
    }
    
    return {
      type: isWinning ? 'win' : 'loss',
      count
    };
  }, [trades]);

  if (streak.count < 2) {
    return null;
  }

  const isWinStreak = streak.type === 'win';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              isWinStreak 
                ? 'bg-success/10 text-success border border-success/30 shadow-[0_0_12px_hsl(var(--success)/0.2)]' 
                : 'bg-danger/10 text-danger border border-danger/30 shadow-[0_0_12px_hsl(var(--danger)/0.2)]'
            }`}
          >
            {isWinStreak ? (
              <Flame className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <Snowflake className="h-3.5 w-3.5" />
            )}
            <span>{streak.count} {isWinStreak ? 'Wins' : 'Losses'}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover border border-border">
          <p className="text-xs">
            {isWinStreak 
              ? `🔥 Você está em uma sequência de ${streak.count} vitórias! Continue assim!`
              : `❄️ Sequência de ${streak.count} perdas. Considere pausar e revisar sua estratégia.`
            }
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
