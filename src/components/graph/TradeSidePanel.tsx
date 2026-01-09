import { Trade } from "@/lib/parseTradeReport";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, Clock, Calendar, Coins, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TradeJourneyChart, TradeStats } from "@/components/journal";

interface TradeSidePanelProps {
  trade: Trade | null;
  onClose: () => void;
}

export function TradeSidePanel({ trade, onClose }: TradeSidePanelProps) {
  const isProfit = trade ? trade.netProfit >= 0 : false;

  return (
    <AnimatePresence>
      {trade && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-[420px] bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className={cn(
            "px-6 py-4 border-b flex items-center justify-between",
            isProfit ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isProfit ? "bg-success/20" : "bg-danger/20"
              )}>
                {isProfit ? (
                  <TrendingUp className="h-5 w-5 text-success" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-danger" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{trade.symbol}</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    trade.type === "buy" ? "bg-success/20 text-success" : "bg-danger/20 text-danger"
                  )}>
                    {trade.type === "buy" ? (
                      <span className="flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" /> LONG
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ArrowLeft className="h-3 w-3" /> SHORT
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">Ticket #{trade.ticket}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto h-[calc(100%-80px)] space-y-6">
            {/* P&L Display */}
            <div className={cn(
              "p-6 rounded-xl",
              isProfit ? "bg-success/10 border border-success/20" : "bg-danger/10 border border-danger/20"
            )}>
              <span className="text-xs text-muted-foreground block mb-1">Net Profit</span>
              <span className={cn(
                "text-4xl font-bold",
                isProfit ? "text-success" : "text-danger"
              )}>
                {isProfit ? "+" : ""}${trade.netProfit.toFixed(2)}
              </span>
            </div>

            {/* Trade Stats */}
            <TradeStats trade={trade} />

            {/* Price Journey Chart */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Price Journey</h3>
              <TradeJourneyChart trade={trade} />
            </div>

            {/* Trade Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Trade Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Open Date</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {format(trade.openTime, "dd MMM yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-xs">Close Date</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {format(trade.closeTime, "dd MMM yyyy HH:mm", { locale: ptBR })}
                  </span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-xs">Duration</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {trade.duration >= 60
                      ? `${Math.floor(trade.duration / 60)}h ${trade.duration % 60}m`
                      : `${trade.duration}m`}
                  </span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                    <Coins className="h-3.5 w-3.5" />
                    <span className="text-xs">Lot Size</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{trade.size}</span>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">Entry Price</span>
                  <span className="text-sm font-mono text-foreground">{trade.openPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-muted-foreground">Exit Price</span>
                  <span className="text-sm font-mono text-foreground">{trade.closePrice}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Pips</span>
                  <span className={cn(
                    "text-sm font-medium",
                    isProfit ? "text-success" : "text-danger"
                  )}>
                    {isProfit ? "+" : ""}{((trade.closePrice - trade.openPrice) * (trade.type === "buy" ? 1 : -1) * 10000).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Fees */}
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Commission</span>
                  <span className="text-sm font-mono text-danger">${Math.abs(trade.commission).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Swap</span>
                  <span className={cn(
                    "text-sm font-mono",
                    trade.swap >= 0 ? "text-success" : "text-danger"
                  )}>${trade.swap.toFixed(2)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Gross Profit</span>
                  <span className={cn(
                    "text-sm font-mono",
                    trade.profit >= 0 ? "text-success" : "text-danger"
                  )}>${trade.profit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
