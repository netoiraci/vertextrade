import { Shield, AlertTriangle, CheckCircle, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PropFirmGuardianProps {
  todayPnL: number;
  dailyLossLimit: number;
  maxDrawdown: number;
  maxDrawdownLimit: number;
  currentBalance: number;
  initialBalance: number;
}

export function PropFirmGuardian({
  todayPnL,
  dailyLossLimit,
  maxDrawdown,
  maxDrawdownLimit,
  currentBalance,
  initialBalance,
}: PropFirmGuardianProps) {
  // Calcular % do limite diário usado
  const dailyLossUsed = todayPnL < 0 ? Math.abs(todayPnL) : 0;
  const dailyLossPercent = (dailyLossUsed / dailyLossLimit) * 100;
  const dailyRemaining = dailyLossLimit - dailyLossUsed;

  // Calcular % do drawdown máximo
  const drawdownPercent = (maxDrawdown / maxDrawdownLimit) * 100;
  const drawdownRemaining = maxDrawdownLimit - maxDrawdown;

  // Status geral
  const getDailyStatus = () => {
    if (dailyLossPercent >= 80) return { color: "danger", label: "Crítico", pulse: true };
    if (dailyLossPercent >= 50) return { color: "warning", label: "Atenção", pulse: false };
    return { color: "success", label: "OK", pulse: false };
  };

  const getDrawdownStatus = () => {
    if (drawdownPercent >= 80) return { color: "danger", label: "Crítico", pulse: true };
    if (drawdownPercent >= 50) return { color: "warning", label: "Atenção", pulse: false };
    return { color: "success", label: "OK", pulse: false };
  };

  const dailyStatus = getDailyStatus();
  const ddStatus = getDrawdownStatus();

  // Meta de profit (exemplo: 10% da conta)
  const profitTarget = initialBalance * 0.1;
  const profitProgress = ((currentBalance - initialBalance) / profitTarget) * 100;
  const isOnTarget = currentBalance > initialBalance;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card/80 border-border/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Prop Firm Guardian</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Daily Loss Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Limite Diário</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    dailyStatus.color === "danger" && "border-danger text-danger",
                    dailyStatus.color === "warning" && "border-warning text-warning",
                    dailyStatus.color === "success" && "border-success text-success"
                  )}
                >
                  {dailyStatus.label}
                </Badge>
              </div>
              
              <div className="relative">
                <Progress 
                  value={Math.min(dailyLossPercent, 100)} 
                  className={cn(
                    "h-3",
                    dailyStatus.pulse && "animate-pulse"
                  )}
                  indicatorClassName={cn(
                    dailyStatus.color === "danger" && "bg-danger",
                    dailyStatus.color === "warning" && "bg-warning",
                    dailyStatus.color === "success" && "bg-success"
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className={cn(
                  todayPnL < 0 ? "text-danger" : "text-success"
                )}>
                  Hoje: ${todayPnL.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  Resta: ${dailyRemaining.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Max Drawdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Max Drawdown</span>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    ddStatus.color === "danger" && "border-danger text-danger",
                    ddStatus.color === "warning" && "border-warning text-warning",
                    ddStatus.color === "success" && "border-success text-success"
                  )}
                >
                  {ddStatus.label}
                </Badge>
              </div>
              
              <div className="relative">
                <Progress 
                  value={Math.min(drawdownPercent, 100)} 
                  className={cn(
                    "h-3",
                    ddStatus.pulse && "animate-pulse"
                  )}
                  indicatorClassName={cn(
                    ddStatus.color === "danger" && "bg-danger",
                    ddStatus.color === "warning" && "bg-warning",
                    ddStatus.color === "success" && "bg-success"
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-danger">
                  <TrendingDown className="h-3 w-3 inline mr-1" />
                  ${maxDrawdown.toFixed(2)}
                </span>
                <span className="text-muted-foreground">
                  Limite: ${maxDrawdownLimit.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Status Geral */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {dailyLossPercent < 100 && drawdownPercent < 100 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-danger" />
                  )}
                  <span className="text-sm">
                    Regras: {dailyLossPercent < 100 && drawdownPercent < 100 ? "Aprovado" : "Violação"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isOnTarget ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm">
                    Meta: {isOnTarget ? `${Math.min(profitProgress, 100).toFixed(0)}%` : "Em andamento"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
