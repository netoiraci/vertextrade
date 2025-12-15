import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/lib/parseTradeReport";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTradingAccounts } from "@/hooks/useTradingAccounts";

export function useTrades() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { activeAccountId } = useTradingAccounts();

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ["trades", user?.id, activeAccountId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("close_time", { ascending: false });

      // Filter by active account if one is selected
      if (activeAccountId) {
        query = query.eq("account_id", activeAccountId);
      }

      const { data, error } = await query;

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
    enabled: !!user,
  });

  const saveTrades = useMutation({
    mutationFn: async (newTrades: Trade[]) => {
      if (!user) throw new Error("User not authenticated");
      
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
        user_id: user.id,
        account_id: activeAccountId,
      }));

      const { error } = await supabase.from("trades").insert(tradesToInsert);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Sucesso",
        description: "Operações salvas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar operações",
        variant: "destructive",
      });
    },
  });

  const deleteAllTrades = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      let query = supabase
        .from("trades")
        .delete()
        .eq("user_id", user.id);

      // Delete only trades from active account if one is selected
      if (activeAccountId) {
        query = query.eq("account_id", activeAccountId);
      }

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Sucesso",
        description: "Operações da conta ativa foram deletadas!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao deletar operações",
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
