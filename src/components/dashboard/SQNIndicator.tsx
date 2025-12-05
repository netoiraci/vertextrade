import { useMemo } from "react";
import { Trade } from "@/lib/parseTradeReport";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SQNIndicatorProps {
  trades: Trade[];
}

export function SQNIndicator({ trades }: SQNIndicatorProps) {
  const sqnData = useMemo(() => {
    if (trades.length < 10) {
      return { sqn: 0, classification: "Insuficiente", color: "muted" };
    }

    // SQN = (Média dos R-Múltiplos / Desvio Padrão dos R-Múltiplos) * √N
    // Simplificação: Usamos netProfit como "R" 
    const profits = trades.map(t => t.netProfit);
    const n = profits.length;
    
    // Média
    const mean = profits.reduce((a, b) => a + b, 0) / n;
    
    // Desvio padrão
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return { sqn: 0, classification: "N/A", color: "muted" };
    
    // SQN ajustado (Van Tharp recomenda usar √min(N, 100))
    const sqn = (mean / stdDev) * Math.sqrt(Math.min(n, 100));
    
    // Classificação segundo Van Tharp
    let classification: string;
    let color: string;
    
    if (sqn < 1.6) {
      classification = "Pobre";
      color = "danger";
    } else if (sqn < 1.9) {
      classification = "Abaixo Média";
      color = "warning";
    } else if (sqn < 2.4) {
      classification = "Médio";
      color = "warning";
    } else if (sqn < 2.9) {
      classification = "Bom";
      color = "success";
    } else if (sqn < 5.0) {
      classification = "Excelente";
      color = "success";
    } else if (sqn < 7.0) {
      classification = "Soberbo";
      color = "primary";
    } else {
      classification = "Santo Graal";
      color = "primary";
    }
    
    return { sqn, classification, color };
  }, [trades]);

  if (trades.length < 10) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="bg-card/50 border-border/50 cursor-help">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">SQN</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{sqnData.sqn.toFixed(2)}</span>
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    sqnData.color === "danger" && "border-danger text-danger",
                    sqnData.color === "warning" && "border-warning text-warning",
                    sqnData.color === "success" && "border-success text-success",
                    sqnData.color === "primary" && "border-primary text-primary",
                    sqnData.color === "muted" && "border-muted text-muted-foreground"
                  )}
                >
                  {sqnData.classification}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[300px]">
          <p className="text-sm font-medium mb-2">System Quality Number (Van Tharp)</p>
          <p className="text-xs text-muted-foreground">
            Mede a qualidade do sistema de trading considerando média de lucros, 
            consistência (desvio padrão) e número de trades.
          </p>
          <div className="mt-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-danger">{"< 1.6: Pobre"}</span>
              <span className="text-success">{"> 2.9: Excelente"}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
