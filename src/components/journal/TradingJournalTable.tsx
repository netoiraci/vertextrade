import { useMemo, useState, useId, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trade } from '@/lib/parseTradeReport';
import { formatPnL, getPnLColor, calculateDuration } from '@/lib/tradeUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Star,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Filter,
} from 'lucide-react';

interface TradingJournalTableProps {
  trades: Trade[];
  selectedTrade: Trade | null;
  onTradeSelect: (trade: Trade) => void;
  pinnedTrades: Set<string>;
  onTogglePin: (ticketId: string) => void;
}

export function TradingJournalTable({
  trades,
  selectedTrade,
  onTradeSelect,
  pinnedTrades,
  onTogglePin,
}: TradingJournalTableProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'closeTime', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Sort data to show pinned trades first
  const sortedData = useMemo(() => {
    return [...trades].sort((a, b) => {
      const aIsPinned = pinnedTrades.has(a.ticket);
      const bIsPinned = pinnedTrades.has(b.ticket);
      if (aIsPinned && !bIsPinned) return -1;
      if (!aIsPinned && bIsPinned) return 1;
      return 0;
    });
  }, [trades, pinnedTrades]);

  const columns: ColumnDef<Trade>[] = [
    {
      id: 'pin',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 transition-transform hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(row.original.ticket);
          }}
        >
          <Star
            className={cn(
              'h-4 w-4 transition-all',
              pinnedTrades.has(row.original.ticket)
                ? 'fill-yellow-500 text-yellow-500 drop-shadow-sm'
                : 'text-muted-foreground'
            )}
          />
        </Button>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'ticket',
      header: 'Ticket',
      cell: ({ row }) => (
        <span className="font-mono text-xs">{row.getValue('ticket')}</span>
      ),
    },
    {
      accessorKey: 'symbol',
      header: 'Símbolo',
      cell: ({ row }) => (
        <span className="font-semibold uppercase">{row.getValue('symbol')}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge
          variant={row.getValue('type') === 'buy' ? 'default' : 'destructive'}
          className="uppercase"
        >
          {row.getValue('type') === 'buy' ? 'BUY' : 'SELL'}
        </Badge>
      ),
    },
    {
      accessorKey: 'size',
      header: 'Volume',
      cell: ({ row }) => (
        <span>{(row.getValue('size') as number).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'openTime',
      header: ({ column }) => {
        return (
          <div
            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
            onClick={column.getToggleSortingHandler()}
          >
            Abertura
            {{
              asc: <ChevronUp className="h-4 w-4 opacity-60" />,
              desc: <ChevronDown className="h-4 w-4 opacity-60" />,
            }[column.getIsSorted() as string] ?? null}
          </div>
        );
      },
      cell: ({ row }) => (
        <span className="text-xs">
          {format(row.getValue('openTime'), 'dd/MM HH:mm', { locale: ptBR })}
        </span>
      ),
    },
    {
      accessorKey: 'closeTime',
      header: ({ column }) => {
        return (
          <div
            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
            onClick={column.getToggleSortingHandler()}
          >
            Fechamento
            {{
              asc: <ChevronUp className="h-4 w-4 opacity-60" />,
              desc: <ChevronDown className="h-4 w-4 opacity-60" />,
            }[column.getIsSorted() as string] ?? null}
          </div>
        );
      },
      cell: ({ row }) => (
        <span className="text-xs">
          {format(row.getValue('closeTime'), 'dd/MM HH:mm', { locale: ptBR })}
        </span>
      ),
    },
    {
      id: 'duration',
      header: 'Duração',
      cell: ({ row }) => (
        <span className="text-xs">
          {calculateDuration(row.original.openTime, row.original.closeTime)}
        </span>
      ),
    },
    {
      accessorKey: 'netProfit',
      header: ({ column }) => {
        return (
          <div
            className="flex h-full cursor-pointer select-none items-center justify-between gap-2"
            onClick={column.getToggleSortingHandler()}
          >
            PnL
            {{
              asc: <ChevronUp className="h-4 w-4 opacity-60" />,
              desc: <ChevronDown className="h-4 w-4 opacity-60" />,
            }[column.getIsSorted() as string] ?? null}
          </div>
        );
      },
      cell: ({ row }) => (
        <span
          className={cn(
            'font-bold text-base',
            getPnLColor(row.getValue('netProfit'))
          )}
        >
          {formatPnL(row.getValue('netProfit'))}
        </span>
      ),
      filterFn: (row, id, filterValue) => {
        if (filterValue === 'win') return row.original.netProfit > 0;
        if (filterValue === 'loss') return row.original.netProfit < 0;
        return true;
      },
    },
  ];

  const table = useReactTable({
    data: sortedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Histórico de Operações</h2>
          <p className="text-sm text-muted-foreground">
            {sortedData.filter((t) => pinnedTrades.has(t.ticket)).length} trade(s) fixado(s) • Clique na estrela para fixar
          </p>
        </div>
        <Badge variant="outline" className="hidden md:flex items-center gap-1.5">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
          Clique em uma linha para detalhes
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60 max-w-80">
          <Input
            id={`${id}-search`}
            ref={inputRef}
            className={cn(
              'peer ps-9 bg-secondary border-border',
              Boolean(table.getColumn('ticket')?.getFilterValue()) && 'pe-9'
            )}
            value={(table.getColumn('ticket')?.getFilterValue() ?? '') as string}
            onChange={(e) => table.getColumn('ticket')?.setFilterValue(e.target.value)}
            placeholder="Buscar por ticket..."
            type="text"
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search className="h-4 w-4" />
          </div>
          {Boolean(table.getColumn('ticket')?.getFilterValue()) && (
            <button
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 transition-colors hover:text-foreground"
              onClick={() => {
                table.getColumn('ticket')?.setFilterValue('');
                inputRef.current?.focus();
              }}
            >
              <CircleX className="h-4 w-4" />
            </button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-secondary border-border">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Filtrar por resultado</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={!table.getColumn('netProfit')?.getFilterValue()}
              onCheckedChange={() => table.getColumn('netProfit')?.setFilterValue(undefined)}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={table.getColumn('netProfit')?.getFilterValue() === 'win'}
              onCheckedChange={() => table.getColumn('netProfit')?.setFilterValue('win')}
            >
              Apenas Lucros
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={table.getColumn('netProfit')?.getFilterValue() === 'loss'}
              onCheckedChange={() => table.getColumn('netProfit')?.setFilterValue('loss')}
            >
              Apenas Perdas
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onTradeSelect(row.original)}
                  className={cn(
                    'cursor-pointer transition-all duration-200',
                    'hover:bg-muted/50',
                    pinnedTrades.has(row.original.ticket) &&
                      'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30',
                    selectedTrade?.ticket === row.original.ticket &&
                      'bg-primary/10 border-l-4 border-primary hover:bg-primary/15'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <Label htmlFor={id} className="max-sm:sr-only text-muted-foreground">
            Linhas por página
          </Label>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger id={id} className="w-fit whitespace-nowrap bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex grow justify-end whitespace-nowrap text-sm text-muted-foreground">
          <p>
            <span className="text-foreground">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getRowCount()
              )}
            </span>{' '}
            de <span className="text-foreground">{table.getRowCount()}</span>
          </p>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.firstPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-secondary border-border"
              >
                <ChevronFirst className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="bg-secondary border-border"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="bg-secondary border-border"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                onClick={() => table.lastPage()}
                disabled={!table.getCanNextPage()}
                className="bg-secondary border-border"
              >
                <ChevronLast className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
