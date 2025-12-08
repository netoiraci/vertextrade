import { Search, X, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface TradeFiltersState {
  search: string;
  timePeriod: string;
  outcome: string;
  side: string;
  duration: string;
  specificDate: Date | undefined;
  selectedMonth: string;
  selectedYear: string;
}

interface TradeFiltersProps {
  filters: TradeFiltersState;
  onFiltersChange: (filters: TradeFiltersState) => void;
}

export const defaultFilters: TradeFiltersState = {
  search: "",
  timePeriod: "all",
  outcome: "all",
  side: "all",
  duration: "all",
  specificDate: undefined,
  selectedMonth: "all",
  selectedYear: "all",
};

// Generate years from 2020 to current year
const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 2019 }, (_, i) => (2020 + i).toString());

const months = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

export function TradeFilters({ filters, onFiltersChange }: TradeFiltersProps) {
  const hasActiveFilters = 
    filters.search !== "" ||
    filters.timePeriod !== "all" ||
    filters.outcome !== "all" ||
    filters.side !== "all" ||
    filters.duration !== "all" ||
    filters.specificDate !== undefined ||
    filters.selectedMonth !== "all" ||
    filters.selectedYear !== "all";

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symbol..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[140px] justify-start text-left font-normal bg-secondary border-border",
              !filters.specificDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.specificDate ? format(filters.specificDate, "dd/MM/yyyy") : "Data"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.specificDate}
            onSelect={(date) => onFiltersChange({ 
              ...filters, 
              specificDate: date,
              timePeriod: date ? "all" : filters.timePeriod 
            })}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {/* Month Filter */}
      <Select
        value={filters.selectedMonth}
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          selectedMonth: value,
          specificDate: value !== "all" ? undefined : filters.specificDate,
          timePeriod: value !== "all" ? "all" : filters.timePeriod
        })}
      >
        <SelectTrigger className="w-[130px] bg-secondary border-border">
          <SelectValue placeholder="Mês" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Meses</SelectItem>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Year Filter */}
      <Select
        value={filters.selectedYear}
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          selectedYear: value,
          specificDate: value !== "all" ? undefined : filters.specificDate,
          timePeriod: value !== "all" ? "all" : filters.timePeriod
        })}
      >
        <SelectTrigger className="w-[100px] bg-secondary border-border">
          <SelectValue placeholder="Ano" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos Anos</SelectItem>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Time Period */}
      <Select
        value={filters.timePeriod}
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          timePeriod: value,
          specificDate: value !== "all" ? undefined : filters.specificDate,
          selectedMonth: value !== "all" ? "all" : filters.selectedMonth,
          selectedYear: value !== "all" ? "all" : filters.selectedYear
        })}
      >
        <SelectTrigger className="w-[130px] bg-secondary border-border">
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="3months">Last 3 Months</SelectItem>
        </SelectContent>
      </Select>

      {/* Outcome */}
      <Select
        value={filters.outcome}
        onValueChange={(value) => onFiltersChange({ ...filters, outcome: value })}
      >
        <SelectTrigger className="w-[130px] bg-secondary border-border">
          <SelectValue placeholder="All Outcomes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Outcomes</SelectItem>
          <SelectItem value="win">Wins Only</SelectItem>
          <SelectItem value="loss">Losses Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Side */}
      <Select
        value={filters.side}
        onValueChange={(value) => onFiltersChange({ ...filters, side: value })}
      >
        <SelectTrigger className="w-[110px] bg-secondary border-border">
          <SelectValue placeholder="All Sides" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sides</SelectItem>
          <SelectItem value="buy">Long Only</SelectItem>
          <SelectItem value="sell">Short Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Duration */}
      <Select
        value={filters.duration}
        onValueChange={(value) => onFiltersChange({ ...filters, duration: value })}
      >
        <SelectTrigger className="w-[130px] bg-secondary border-border">
          <SelectValue placeholder="All Durations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Durations</SelectItem>
          <SelectItem value="scalp">Scalp (&lt;5 min)</SelectItem>
          <SelectItem value="short">Short (5-30 min)</SelectItem>
          <SelectItem value="medium">Medium (30m-2h)</SelectItem>
          <SelectItem value="long">Long (&gt;2h)</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearFilters}
          className="h-10 w-10 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
