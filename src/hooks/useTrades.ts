import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/lib/parseTradeReport";
import { useToast } from "@/hooks/use-toast";

export function useTrades() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["trades"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("close_time", { ascending: false });

      if (error) throw error;

      return (data || []).map((trade) => ({
        ...trade,
        openTime: new Date(trade.open_time),
        closeTime: new Date(trade.close_time),
        isWin: trade.is_win,
        netProfit: Number(trade.net_profit),
        openPrice: Number(trade.open_price),
        closePrice: Number(trade.close_price),
        size: Number(trade.size),
        commission: Number(trade.commission),
        swap: Number(trade.swap),
        profit: Number(trade.profit),
        duration: Number(trade.duration),
      })) as Trade[];
    },
  });

  const saveTrades = useMutation({
    mutationFn: async (newTrades: Trade[]) => {
      const tradesToInsert = newTrades.map((trade) => ({
        ticket: trade.ticket,
        open_time: trade.openTime.toISOString(),
        type: trade.type,
        size: trade.size,
        symbol: trade.symbol,
        open_price: trade.openPrice,
        close_time: trade.closeTime.toISOString(),
        close_price: trade.closePrice,
        commission: trade.commission,
        swap: trade.swap,
        profit: trade.profit,
        net_profit: trade.netProfit,
        duration: trade.duration,
        is_win: trade.isWin,
      }));

      const { error } = await supabase.from("trades").insert(tradesToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Success",
        description: "Trades saved successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save trades",
        variant: "destructive",
      });
    },
  });

  const deleteAllTrades = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("trades").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Success",
        description: "All trades deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete trades",
        variant: "destructive",
      });
    },
  });

  return {
    trades,
    isLoading,
    saveTrades: saveTrades.mutate,
    deleteAllTrades: deleteAllTrades.mutate,
    isSaving: saveTrades.isPending,
    isDeleting: deleteAllTrades.isPending,
  };
}
