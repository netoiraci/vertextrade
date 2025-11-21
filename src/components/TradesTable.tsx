import { Trade } from "@/lib/parseTradeReport";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TradesTableProps {
  trades: Trade[];
}

export function TradesTable({ trades }: TradesTableProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Open Price</TableHead>
              <TableHead>Close Price</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.slice(0, 10).map((trade) => (
              <TableRow key={trade.ticket}>
                <TableCell className="font-mono text-sm">{trade.ticket}</TableCell>
                <TableCell className="font-medium">{trade.symbol}</TableCell>
                <TableCell>
                  <span className={trade.type === 'buy' ? 'text-success' : 'text-danger'}>
                    {trade.type.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{trade.size.toFixed(2)}</TableCell>
                <TableCell>{trade.openPrice.toFixed(5)}</TableCell>
                <TableCell>{trade.closePrice.toFixed(5)}</TableCell>
                <TableCell className={trade.netProfit >= 0 ? 'text-success' : 'text-danger'}>
                  ${trade.netProfit.toFixed(2)}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.isWin
                        ? 'bg-success/10 text-success'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {trade.isWin ? 'WIN' : 'LOSS'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
