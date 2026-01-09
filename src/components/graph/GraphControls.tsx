import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  EyeOff,
  GitBranch,
  Focus,
  Globe2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphControlsProps {
  depth: number;
  onDepthChange: (value: number) => void;
  hideOrphans: boolean;
  onHideOrphansChange: (value: boolean) => void;
  viewMode: "global" | "local";
  onViewModeChange: (mode: "global" | "local") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  selectedTradeId?: string | null;
}

export function GraphControls({
  depth,
  onDepthChange,
  hideOrphans,
  onHideOrphansChange,
  viewMode,
  onViewModeChange,
  onZoomIn,
  onZoomOut,
  onFitView,
  selectedTradeId,
}: GraphControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
      {/* View Mode Toggle */}
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <GitBranch className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium text-foreground">View Mode</span>
        </div>
        <div className="flex gap-1">
          <Button
            variant={viewMode === "global" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("global")}
            className={cn(
              "flex items-center gap-1.5 text-xs h-8",
              viewMode === "global" && "bg-primary text-primary-foreground"
            )}
          >
            <Globe2 className="h-3.5 w-3.5" />
            Global
          </Button>
          <Button
            variant={viewMode === "local" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("local")}
            disabled={!selectedTradeId}
            className={cn(
              "flex items-center gap-1.5 text-xs h-8",
              viewMode === "local" && "bg-primary text-primary-foreground"
            )}
          >
            <Focus className="h-3.5 w-3.5" />
            Local
          </Button>
        </div>
        {viewMode === "local" && selectedTradeId && (
          <Badge variant="outline" className="mt-2 text-[10px]">
            Focused on #{selectedTradeId.replace("trade-", "")}
          </Badge>
        )}
      </div>

      {/* Depth Control */}
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-foreground">Depth</span>
          <Badge variant="secondary" className="text-[10px]">
            {depth}
          </Badge>
        </div>
        <Slider
          value={[depth]}
          onValueChange={([val]) => onDepthChange(val)}
          min={1}
          max={3}
          step={1}
          className="w-32"
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Sessions</span>
          <span className="text-[10px] text-muted-foreground">All</span>
        </div>
      </div>

      {/* Orphans Toggle */}
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <Label className="flex items-center gap-2 text-xs cursor-pointer">
            {hideOrphans ? (
              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-primary" />
            )}
            <span>Orphans</span>
          </Label>
          <Switch
            checked={!hideOrphans}
            onCheckedChange={(val) => onHideOrphansChange(!val)}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2 shadow-xl">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onFitView}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
