import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { TradeNodeData } from "@/lib/graphUtils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Globe, Sunrise, Sun, Moon } from "lucide-react";

const sessionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "Asia": Moon,
  "London": Sunrise,
  "NY Overlap": Globe,
  "New York": Sun,
};

const sessionColors: Record<string, string> = {
  "Asia": "bg-purple-500/20 border-purple-500/50 text-purple-400",
  "London": "bg-blue-500/20 border-blue-500/50 text-blue-400",
  "NY Overlap": "bg-amber-500/20 border-amber-500/50 text-amber-400",
  "New York": "bg-orange-500/20 border-orange-500/50 text-orange-400",
};

interface SessionNodeProps {
  data: TradeNodeData;
  selected?: boolean;
}

export const SessionNode = memo(({ data, selected }: SessionNodeProps) => {
  const Icon = sessionIcons[data.session ?? "Asia"] || Globe;
  const colorClass = sessionColors[data.session ?? "Asia"] || sessionColors["Asia"];
  const isProfit = (data.totalProfit ?? 0) >= 0;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
      className={cn(
        "p-4 rounded-xl cursor-pointer transition-all duration-300",
        "border-2 shadow-2xl backdrop-blur-sm",
        colorClass,
        selected ? "ring-4 ring-primary/50" : ""
      )}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="flex flex-col items-center gap-2">
        <Icon className="h-6 w-6" />
        <p className="text-sm font-bold">{data.session}</p>
        <div className="text-center">
          <span className="text-xs text-muted-foreground block">
            {data.tradesCount} trades
          </span>
          <span
            className={cn(
              "text-sm font-bold",
              isProfit ? "text-success" : "text-danger"
            )}
          >
            {isProfit ? "+" : ""}${data.totalProfit?.toFixed(0)}
          </span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
});

SessionNode.displayName = "SessionNode";
