import { Globe, Sunrise, Sun, Moon, TrendingUp, TrendingDown, Calendar, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function GraphLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <h4 className="text-xs font-medium text-foreground mb-3">Legenda</h4>
        
        <div className="space-y-3">
          {/* Trade Nodes */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Trades</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_8px_hsl(160_84%_39%_/_0.5)]" />
                <span className="text-[10px] text-muted-foreground">Profit</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-danger shadow-[0_0_8px_hsl(351_95%_61%_/_0.5)]" />
                <span className="text-[10px] text-muted-foreground">Loss</span>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Sessões</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <Moon className="h-3 w-3 text-purple-400" />
                <span className="text-[10px] text-muted-foreground">Asia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sunrise className="h-3 w-3 text-blue-400" />
                <span className="text-[10px] text-muted-foreground">London</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-muted-foreground">Overlap</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sun className="h-3 w-3 text-orange-400" />
                <span className="text-[10px] text-muted-foreground">NY</span>
              </div>
            </div>
          </div>

          {/* Other Nodes */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Grupos</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">Ativos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Datas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
