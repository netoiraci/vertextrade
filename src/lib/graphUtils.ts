import { Trade } from "@/lib/parseTradeReport";
import { Edge } from "@xyflow/react";

export type NodeType = "trade" | "asset" | "date" | "session";

export interface TradeNodeData extends Record<string, unknown> {
  type: NodeType;
  trade?: Trade;
  label: string;
  profit?: number;
  symbol?: string;
  date?: string;
  session?: string;
  tradesCount?: number;
  totalProfit?: number;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: TradeNodeData;
}

// Market Sessions based on UTC time
export function getMarketSession(date: Date): string {
  const hour = date.getUTCHours();
  
  if (hour >= 0 && hour < 8) return "Asia";
  if (hour >= 8 && hour < 13) return "London";
  if (hour >= 13 && hour < 17) return "NY Overlap";
  if (hour >= 17 && hour < 22) return "New York";
  return "Asia";
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

interface GraphData {
  nodes: GraphNode[];
  edges: Edge[];
}

export function generateGraphData(
  trades: Trade[],
  depthLevel: number = 2,
  hideOrphans: boolean = false
): GraphData {
  const nodes: GraphNode[] = [];
  const edges: Edge[] = [];
  const assetNodes = new Map<string, { trades: Trade[]; totalProfit: number }>();
  const dateNodes = new Map<string, { trades: Trade[]; totalProfit: number }>();
  const sessionNodes = new Map<string, { trades: Trade[]; totalProfit: number }>();

  // Group trades by asset, date, and session
  trades.forEach((trade) => {
    const dateKey = formatDateKey(trade.closeTime);
    const session = getMarketSession(trade.openTime);

    // Group by asset
    if (!assetNodes.has(trade.symbol)) {
      assetNodes.set(trade.symbol, { trades: [], totalProfit: 0 });
    }
    const assetData = assetNodes.get(trade.symbol)!;
    assetData.trades.push(trade);
    assetData.totalProfit += trade.netProfit;

    // Group by date
    if (!dateNodes.has(dateKey)) {
      dateNodes.set(dateKey, { trades: [], totalProfit: 0 });
    }
    const dateData = dateNodes.get(dateKey)!;
    dateData.trades.push(trade);
    dateData.totalProfit += trade.netProfit;

    // Group by session
    if (!sessionNodes.has(session)) {
      sessionNodes.set(session, { trades: [], totalProfit: 0 });
    }
    const sessionData = sessionNodes.get(session)!;
    sessionData.trades.push(trade);
    sessionData.totalProfit += trade.netProfit;
  });

  // Calculate positions based on force layout simulation
  const centerX = 0;
  const centerY = 0;
  const tradeRadius = 350;
  const assetRadius = 550;
  const dateRadius = 700;
  const sessionRadius = 200;

  // Add session nodes at center
  const sessions = Array.from(sessionNodes.entries());
  sessions.forEach(([session, data], index) => {
    const angle = (index / sessions.length) * 2 * Math.PI;
    nodes.push({
      id: `session-${session}`,
      type: "sessionNode",
      position: {
        x: centerX + Math.cos(angle) * sessionRadius,
        y: centerY + Math.sin(angle) * sessionRadius,
      },
      data: {
        type: "session",
        label: session,
        session,
        tradesCount: data.trades.length,
        totalProfit: data.totalProfit,
      },
    });
  });

  // Add trade nodes in a ring around center
  const sortedTrades = [...trades].sort(
    (a, b) => a.closeTime.getTime() - b.closeTime.getTime()
  );
  
  sortedTrades.forEach((trade, index) => {
    const angle = (index / trades.length) * 2 * Math.PI - Math.PI / 2;
    const session = getMarketSession(trade.openTime);

    nodes.push({
      id: `trade-${trade.ticket}`,
      type: "tradeNode",
      position: {
        x: centerX + Math.cos(angle) * tradeRadius,
        y: centerY + Math.sin(angle) * tradeRadius,
      },
      data: {
        type: "trade",
        trade,
        label: `#${trade.ticket}`,
        profit: trade.netProfit,
        symbol: trade.symbol,
        session,
      },
    });

    // Connect trade to session
    if (depthLevel >= 1) {
      edges.push({
        id: `edge-trade-session-${trade.ticket}`,
        source: `trade-${trade.ticket}`,
        target: `session-${session}`,
        animated: false,
        style: { stroke: "hsl(var(--border))", strokeWidth: 1, opacity: 0.3 },
      });
    }
  });

  // Add asset nodes around the trades
  const assets = Array.from(assetNodes.entries());
  assets.forEach(([symbol, data], index) => {
    const angle = (index / assets.length) * 2 * Math.PI;
    nodes.push({
      id: `asset-${symbol}`,
      type: "assetNode",
      position: {
        x: centerX + Math.cos(angle) * assetRadius,
        y: centerY + Math.sin(angle) * assetRadius,
      },
      data: {
        type: "asset",
        label: symbol,
        symbol,
        tradesCount: data.trades.length,
        totalProfit: data.totalProfit,
      },
    });

    // Connect trades to their asset
    if (depthLevel >= 2) {
      data.trades.forEach((trade) => {
        edges.push({
          id: `edge-trade-asset-${trade.ticket}-${symbol}`,
          source: `trade-${trade.ticket}`,
          target: `asset-${symbol}`,
          animated: false,
          style: { stroke: "hsl(var(--border))", strokeWidth: 1, opacity: 0.4 },
        });
      });
    }
  });

  // Add date nodes at the outer ring
  if (depthLevel >= 3) {
    const dates = Array.from(dateNodes.entries()).slice(0, 30); // Limit to last 30 days
    dates.forEach(([dateKey, data], index) => {
      const angle = (index / dates.length) * 2 * Math.PI - Math.PI / 4;
      nodes.push({
        id: `date-${dateKey}`,
        type: "dateNode",
        position: {
          x: centerX + Math.cos(angle) * dateRadius,
          y: centerY + Math.sin(angle) * dateRadius,
        },
        data: {
          type: "date",
          label: new Date(dateKey).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          }),
          date: dateKey,
          tradesCount: data.trades.length,
          totalProfit: data.totalProfit,
        },
      });

      // Connect trades to their date
      data.trades.forEach((trade) => {
        edges.push({
          id: `edge-trade-date-${trade.ticket}-${dateKey}`,
          source: `trade-${trade.ticket}`,
          target: `date-${dateKey}`,
          animated: false,
          style: { stroke: "hsl(var(--border))", strokeWidth: 1, opacity: 0.2 },
        });
      });
    });
  }

  // Filter orphan nodes if needed
  if (hideOrphans) {
    const connectedNodeIds = new Set<string>();
    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    return {
      nodes: nodes.filter(
        (node) => connectedNodeIds.has(node.id) || node.data.type !== "trade"
      ),
      edges,
    };
  }

  return { nodes, edges };
}

// Find related trades for local view
export function getRelatedTrades(
  trade: Trade,
  allTrades: Trade[],
  depth: number = 1
): Trade[] {
  const related = new Set<string>();
  const queue: { trade: Trade; currentDepth: number }[] = [{ trade, currentDepth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.currentDepth >= depth) continue;

    allTrades.forEach((t) => {
      if (t.ticket === current.trade.ticket) return;
      if (related.has(t.ticket)) return;

      // Same asset
      if (t.symbol === current.trade.symbol) {
        related.add(t.ticket);
        queue.push({ trade: t, currentDepth: current.currentDepth + 1 });
        return;
      }

      // Same day
      const sameDay =
        formatDateKey(t.closeTime) === formatDateKey(current.trade.closeTime);
      if (sameDay) {
        related.add(t.ticket);
        queue.push({ trade: t, currentDepth: current.currentDepth + 1 });
        return;
      }

      // Same session
      if (
        getMarketSession(t.openTime) === getMarketSession(current.trade.openTime)
      ) {
        related.add(t.ticket);
        queue.push({ trade: t, currentDepth: current.currentDepth + 1 });
      }
    });
  }

  return allTrades.filter((t) => related.has(t.ticket));
}
