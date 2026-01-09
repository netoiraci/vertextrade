import { Table, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type ViewType = "table" | "graph";

interface ViewToggleProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

export function ViewToggle({ view, onViewChange, className }: ViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 p-1 bg-secondary/50 rounded-lg border border-border",
        className
      )}
    >
      <button
        onClick={() => onViewChange("table")}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          view === "table" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {view === "table" && (
          <motion.div
            layoutId="viewToggle"
            className="absolute inset-0 bg-primary rounded-md"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Table className="h-4 w-4 relative z-10" />
        <span className="relative z-10">Table</span>
      </button>
      <button
        onClick={() => onViewChange("graph")}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          view === "graph" ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {view === "graph" && (
          <motion.div
            layoutId="viewToggle"
            className="absolute inset-0 bg-primary rounded-md"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Network className="h-4 w-4 relative z-10" />
        <span className="relative z-10">Graph</span>
      </button>
    </div>
  );
}
