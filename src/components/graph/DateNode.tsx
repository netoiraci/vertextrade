import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { TradeNodeData } from "@/lib/graphUtils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

interface DateNodeProps {
  data: TradeNodeData;
  selected?: boolean;
}

export const DateNode = memo(({ data, selected }: DateNodeProps) => {
  const isProfit = (data.totalProfit ?? 0) >= 0;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
      className={cn(
        "px-3 py-2 rounded-lg cursor-pointer transition-all duration-300",
        "bg-secondary/50 border backdrop-blur-sm",
        selected ? "ring-4 ring-primary/50" : "",
        isProfit ? "border-success/30" : "border-danger/30"
      )}
    >
      <Handle type="target" position={Position.Left} className="opacity-0" />
      
      <div className="flex items-center gap-2">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <div>
          <p className="text-xs font-medium text-foreground">{data.label}</p>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">
              {data.tradesCount}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium",
                isProfit ? "text-success" : "text-danger"
              )}
            >
              {isProfit ? "+" : ""}${data.totalProfit?.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </motion.div>
  );
});

DateNode.displayName = "DateNode";
