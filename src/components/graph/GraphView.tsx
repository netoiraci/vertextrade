import { useCallback, useState, useMemo, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Trade } from "@/lib/parseTradeReport";
import {
  generateGraphData,
  getRelatedTrades,
  GraphNode,
  TradeNodeData,
} from "@/lib/graphUtils";
import { TradeNode } from "./TradeNode";
import { AssetNode } from "./AssetNode";
import { SessionNode } from "./SessionNode";
import { DateNode } from "./DateNode";
import { GraphControls } from "./GraphControls";
import { GraphLegend } from "./GraphLegend";
import { GraphTooltip } from "./GraphTooltip";
import { TradeSidePanel } from "./TradeSidePanel";
import { cn } from "@/lib/utils";

const nodeTypes = {
  tradeNode: TradeNode,
  assetNode: AssetNode,
  sessionNode: SessionNode,
  dateNode: DateNode,
};

interface GraphViewInnerProps {
  trades: Trade[];
  onTradeSelect?: (trade: Trade) => void;
}

function GraphViewInner({ trades, onTradeSelect }: GraphViewInnerProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [depth, setDepth] = useState(2);
  const [hideOrphans, setHideOrphans] = useState(false);
  const [viewMode, setViewMode] = useState<"global" | "local">("global");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredTrade, setHoveredTrade] = useState<Trade | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sidePanelTrade, setSidePanelTrade] = useState<Trade | null>(null);

  const selectedTrade = useMemo(() => {
    if (!selectedNodeId) return null;
    const ticketId = selectedNodeId.replace("trade-", "");
    return trades.find((t) => t.ticket === ticketId) || null;
  }, [selectedNodeId, trades]);

  // Generate graph data based on view mode
  const { nodes, edges } = useMemo(() => {
    if (viewMode === "local" && selectedTrade) {
      const relatedTrades = getRelatedTrades(selectedTrade, trades, depth);
      const localTrades = [selectedTrade, ...relatedTrades];
      return generateGraphData(localTrades, depth, hideOrphans);
    }
    return generateGraphData(trades, depth, hideOrphans);
  }, [trades, depth, hideOrphans, viewMode, selectedTrade]);

  // Convert GraphNode to ReactFlow Node
  const flowNodes: Node[] = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    [nodes, selectedNodeId]
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);

      if (node.id.startsWith("trade-")) {
        const ticketId = node.id.replace("trade-", "");
        const trade = trades.find((t) => t.ticket === ticketId);
        if (trade) {
          setSidePanelTrade(trade);
          onTradeSelect?.(trade);
        }
      }
    },
    [trades, onTradeSelect]
  );

  const handleNodeMouseEnter = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (node.id.startsWith("trade-")) {
        const ticketId = node.id.replace("trade-", "");
        const trade = trades.find((t) => t.ticket === ticketId);
        if (trade) {
          setHoveredTrade(trade);
          setMousePos({ x: event.clientX, y: event.clientY });
        }
      }
    },
    [trades]
  );

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredTrade(null);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Fit view on initial load and when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 500 });
    }, 100);
    return () => clearTimeout(timer);
  }, [nodes.length, fitView]);

  return (
    <div className="w-full h-[700px] bg-background rounded-xl border border-border overflow-hidden relative">
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeMouseEnter={handleNodeMouseEnter}
        onNodeMouseLeave={handleNodeMouseLeave}
        onPaneClick={handlePaneClick}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          style: { stroke: "hsl(var(--border))", strokeWidth: 1 },
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(var(--border))"
        />
        <MiniMap
          nodeStrokeColor={(n) => {
            const data = n.data as TradeNodeData;
            if (data.type === "trade") {
              return (data.profit ?? 0) >= 0
                ? "hsl(160 84% 39%)"
                : "hsl(351 95% 61%)";
            }
            return "hsl(var(--muted-foreground))";
          }}
          nodeColor={(n) => {
            const data = n.data as TradeNodeData;
            if (data.type === "trade") {
              return (data.profit ?? 0) >= 0
                ? "hsl(160 84% 39% / 0.3)"
                : "hsl(351 95% 61% / 0.3)";
            }
            return "hsl(var(--secondary))";
          }}
          className="!bg-card/80 !backdrop-blur-sm !border-border"
          maskColor="hsl(var(--background) / 0.8)"
        />
      </ReactFlow>

      <GraphControls
        depth={depth}
        onDepthChange={setDepth}
        hideOrphans={hideOrphans}
        onHideOrphansChange={setHideOrphans}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView({ padding: 0.2, duration: 500 })}
        selectedTradeId={selectedNodeId}
      />

      <GraphLegend />

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl">
          <div className="text-xs text-muted-foreground mb-1">Graph Stats</div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-lg font-bold text-foreground">
                {nodes.filter((n) => n.data.type === "trade").length}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">trades</span>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">
                {nodes.filter((n) => n.data.type === "asset").length}
              </span>
              <span className="text-[10px] text-muted-foreground ml-1">assets</span>
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">{edges.length}</span>
              <span className="text-[10px] text-muted-foreground ml-1">links</span>
            </div>
          </div>
        </div>
      </div>

      {hoveredTrade && <GraphTooltip trade={hoveredTrade} position={mousePos} />}

      <TradeSidePanel trade={sidePanelTrade} onClose={() => setSidePanelTrade(null)} />
    </div>
  );
}

interface GraphViewProps {
  trades: Trade[];
  onTradeSelect?: (trade: Trade) => void;
}

export function GraphView({ trades, onTradeSelect }: GraphViewProps) {
  return (
    <ReactFlowProvider>
      <GraphViewInner trades={trades} onTradeSelect={onTradeSelect} />
    </ReactFlowProvider>
  );
}
