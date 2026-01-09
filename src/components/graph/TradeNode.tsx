import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { TradeNodeData } from "@/lib/graphUtils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TradeNodeProps {
  data: TradeNodeData;
  selected?: boolean;
}

export const TradeNode = memo(({ data, selected }: TradeNodeProps) => {
  const isProfit = (data.profit ?? 0) >= 0;
  const profitAmount = Math.abs(data.profit ?? 0);
  
  // Size based on profit magnitude
  const baseSize = 40;
  const maxSize = 70;
  const sizeMultiplier = Math.min(Math.log10(profitAmount + 1) / 3, 1);
  const size = baseSize + (maxSize - baseSize) * sizeMultiplier;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-300",
        "border-2 shadow-lg",
        selected ? "ring-4 ring-primary/50" : "",
        isProfit
          ? "bg-success/20 border-success hover:bg-success/30"
          : "bg-danger/20 border-danger hover:bg-danger/30"
      )}
      style={{
        width: size,
        height: size,
        boxShadow: isProfit
          ? "0 0 20px hsl(160 84% 39% / 0.4)"
          : "0 0 20px hsl(351 95% 61% / 0.4)",
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="text-center">
        <span
          className={cn(
            "text-xs font-bold",
            isProfit ? "text-success" : "text-danger"
          )}
        >
          {isProfit ? "+" : "-"}${profitAmount.toFixed(0)}
        </span>
      </div>

      {/* Symbol badge */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-[10px] text-muted-foreground bg-card/80 px-1 rounded">
          {data.symbol}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
});

TradeNode.displayName = "TradeNode";
