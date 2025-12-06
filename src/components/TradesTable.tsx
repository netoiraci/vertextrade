import { Trade } from "@/lib/parseTradeReport";
import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SmartTag } from "@/components/dashboard/SmartTag";

interface TradesTableProps {
  trades: Trade[];
}

type SortField = 'date' | 'ticket' | 'symbol' | 'type' | 'size' | 'openPrice' | 'closePrice' | 'netProfit';
type SortOrder = 'asc' | 'desc';

export function TradesTable({ trades }: TradesTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const totalPages = Math.ceil(sortedTrades.length / itemsPerPage);
  const paginatedTrades = sortedTrades.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-primary transition-colors text-xs"
    >
      {children}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="text-xs text-muted-foreground font-medium">STATUS</TableHead>
              <TableHead className="text-xs">
                <SortButton field="symbol">SYMBOL</SortButton>
              </TableHead>
              <TableHead className="text-xs">
                <SortButton field="date">ENTRY DATE</SortButton>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">ENTRY TIME</TableHead>
              <TableHead className="text-xs">
                <SortButton field="type">SIDE</SortButton>
              </TableHead>
              <TableHead className="text-xs">
                <SortButton field="openPrice">ENTRY PRICE</SortButton>
              </TableHead>
              <TableHead className="text-xs">
                <SortButton field="closePrice">EXIT PRICE</SortButton>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">EXIT DATE</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">EXIT TIME</TableHead>
              <TableHead className="text-xs">
                <SortButton field="size">SIZE</SortButton>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">FEES</TableHead>
              <TableHead className="text-xs">
                <SortButton field="netProfit">P&L</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTrades.map((trade) => (
              <TableRow key={trade.ticket} className="border-b border-border/50 hover:bg-secondary/30">
                <TableCell>
                  <span className="px-2 py-1 rounded text-xs bg-secondary text-muted-foreground">
                    Closed
                  </span>
                </TableCell>
                <TableCell className="font-medium text-sm uppercase">{trade.symbol}</TableCell>
                <TableCell className="text-sm">
                  {trade.openTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {trade.openTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trade.type === 'buy' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-danger/10 text-danger'
                  }`}>
                    {trade.type === 'buy' ? 'Long' : 'Short'}
                  </span>
                </TableCell>
                <TableCell className="text-sm">{trade.openPrice.toFixed(5)}</TableCell>
                <TableCell className="text-sm">{trade.closePrice.toFixed(5)}</TableCell>
                <TableCell className="text-sm">
                  {trade.closeTime.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {trade.closeTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </TableCell>
                <TableCell className="text-sm">{trade.size.toFixed(2)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {((trade.commission || 0) + (trade.swap || 0)).toFixed(2)}
                </TableCell>
                <TableCell className={`text-sm font-semibold ${trade.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {trade.netProfit >= 0 ? '' : '-'}${Math.abs(trade.netProfit).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 p-4 border-t border-border">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
          <ChevronLeft className="h-4 w-4 -ml-2" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground px-4">
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
          <ChevronRight className="h-4 w-4 -ml-2" />
        </Button>
      </div>
    </div>
  );
}
