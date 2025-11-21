import { Trade } from "@/lib/parseTradeReport";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
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

type SortField = 'date' | 'ticket' | 'symbol' | 'type' | 'size' | 'openPrice' | 'closePrice' | 'netProfit';
type SortOrder = 'asc' | 'desc';

export function TradesTable({ trades }: TradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTrades = [...trades].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'date':
        aValue = a.closeTime.getTime();
        bValue = b.closeTime.getTime();
        break;
      case 'ticket':
        aValue = a.ticket;
        bValue = b.ticket;
        break;
      case 'symbol':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'size':
        aValue = a.size;
        bValue = b.size;
        break;
      case 'openPrice':
        aValue = a.openPrice;
        bValue = b.openPrice;
        break;
      case 'closePrice':
        aValue = a.closePrice;
        bValue = b.closePrice;
        break;
      case 'netProfit':
        aValue = a.netProfit;
        bValue = b.netProfit;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton field="date">Date</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="ticket">Ticket</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="symbol">Symbol</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="type">Type</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="size">Size</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="openPrice">Open Price</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="closePrice">Close Price</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="netProfit">P&L</SortButton>
              </TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrades.slice(0, 20).map((trade) => (
              <TableRow key={trade.ticket}>
                <TableCell className="text-sm">
                  {trade.closeTime.toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-mono text-sm">{trade.ticket}</TableCell>
                <TableCell className="font-medium uppercase">{trade.symbol}</TableCell>
                <TableCell>
                  <span className={trade.type === 'buy' ? 'text-success' : 'text-danger'}>
                    {trade.type.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>{trade.size.toFixed(2)}</TableCell>
                <TableCell>{trade.openPrice.toFixed(5)}</TableCell>
                <TableCell>{trade.closePrice.toFixed(5)}</TableCell>
                <TableCell className={trade.netProfit >= 0 ? 'text-success font-semibold' : 'text-danger font-semibold'}>
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
