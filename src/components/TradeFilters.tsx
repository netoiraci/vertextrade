import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface TradeFiltersState {
  search: string;
  timePeriod: string;
  outcome: string;
  side: string;
  duration: string;
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
};

export function TradeFilters({ filters, onFiltersChange }: TradeFiltersProps) {
  const hasActiveFilters = 
    filters.search !== "" ||
    filters.timePeriod !== "all" ||
    filters.outcome !== "all" ||
    filters.side !== "all" ||
    filters.duration !== "all";

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-lg mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symbol..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {/* Time Period */}
      <Select
        value={filters.timePeriod}
        onValueChange={(value) => onFiltersChange({ ...filters, timePeriod: value })}
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
        <SelectTrigger className="w-[140px] bg-secondary border-border">
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
        <SelectTrigger className="w-[120px] bg-secondary border-border">
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
        <SelectTrigger className="w-[140px] bg-secondary border-border">
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
