import { Trade } from "@/lib/parseTradeReport";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Clock, Calendar, Coins } from "lucide-react";

interface GraphTooltipProps {
  trade: Trade;
  position: { x: number; y: number };
}

export function GraphTooltip({ trade, position }: GraphTooltipProps) {
  const isProfit = trade.netProfit >= 0;

  return (
    <div
      className="fixed z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: position.x + 15,
        top: position.y - 10,
      }}
    >
      <div
        className={cn(
          "bg-card/95 backdrop-blur-md border-2 rounded-xl p-4 shadow-2xl min-w-[200px]",
          isProfit ? "border-success/50" : "border-danger/50"
        )}
        style={{
          boxShadow: isProfit
            ? "0 8px 40px hsl(160 84% 39% / 0.3)"
            : "0 8px 40px hsl(351 95% 61% / 0.3)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {trade.symbol}
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium",
                trade.type === "buy"
                  ? "bg-success/20 text-success"
                  : "bg-danger/20 text-danger"
              )}
            >
              {trade.type.toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">#{trade.ticket}</span>
        </div>

        {/* Profit */}
        <div
          className={cn(
            "flex items-center gap-2 mb-3 p-2 rounded-lg",
            isProfit ? "bg-success/10" : "bg-danger/10"
          )}
        >
          {isProfit ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-danger" />
          )}
          <span
            className={cn(
              "text-xl font-bold",
              isProfit ? "text-success" : "text-danger"
            )}
          >
            {isProfit ? "+" : ""}${trade.netProfit.toFixed(2)}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Data</span>
            </div>
            <span className="text-foreground">
              {format(trade.closeTime, "dd MMM yyyy", { locale: ptBR })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Duração</span>
            </div>
            <span className="text-foreground">
              {trade.duration >= 60
                ? `${Math.floor(trade.duration / 60)}h ${trade.duration % 60}m`
                : `${trade.duration}m`}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Coins className="h-3.5 w-3.5" />
              <span>Lote</span>
            </div>
            <span className="text-foreground">{trade.size}</span>
          </div>
        </div>

        {/* Price info */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Entrada</span>
            <span className="text-foreground">{trade.openPrice}</span>
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-muted-foreground">Saída</span>
            <span className="text-foreground">{trade.closePrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
