import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend = "neutral", delay = 0 }: MetricCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-muted-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-all duration-300 min-w-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">{title}</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className={`text-lg xl:text-xl 2xl:text-2xl font-bold mt-1 ${trendColors[trend]}`}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
}
