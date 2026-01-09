import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { TradeNodeData } from "@/lib/graphUtils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AssetNodeProps {
  data: TradeNodeData;
  selected?: boolean;
}

export const AssetNode = memo(({ data, selected }: AssetNodeProps) => {
  const isProfit = (data.totalProfit ?? 0) >= 0;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
      className={cn(
        "px-4 py-3 rounded-lg cursor-pointer transition-all duration-300",
        "bg-card border-2 shadow-xl",
        selected ? "ring-4 ring-primary/50" : "",
        isProfit ? "border-success/50" : "border-danger/50"
      )}
      style={{
        boxShadow: isProfit
          ? "0 4px 30px hsl(160 84% 39% / 0.2)"
          : "0 4px 30px hsl(351 95% 61% / 0.2)",
      }}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "p-1.5 rounded-md",
            isProfit ? "bg-success/20" : "bg-danger/20"
          )}
        >
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-danger" />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{data.label}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {data.tradesCount} trades
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                isProfit ? "text-success" : "text-danger"
              )}
            >
              {isProfit ? "+" : ""}${data.totalProfit?.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </motion.div>
  );
});

AssetNode.displayName = "AssetNode";
