import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  daily_loss_limit: number;
  max_drawdown_limit: number;
  broker_utc_offset: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ACTIVE_ACCOUNT_KEY = "vertextrade_active_account";

export function useTradingAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeAccountId, setActiveAccountIdState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACTIVE_ACCOUNT_KEY);
    }
    return null;
  });

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["trading-accounts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("trading_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((acc) => ({
        ...acc,
        initial_balance: Number(acc.initial_balance),
        daily_loss_limit: Number(acc.daily_loss_limit),
        max_drawdown_limit: Number(acc.max_drawdown_limit),
        broker_utc_offset: Number(acc.broker_utc_offset),
      })) as TradingAccount[];
    },
    enabled: !!user,
  });

  // Get active account
  const activeAccount = accounts.find(a => a.id === activeAccountId) || accounts[0] || null;

  // Set active account and persist to localStorage
  const setActiveAccountId = useCallback((accountId: string | null) => {
    setActiveAccountIdState(accountId);
    if (accountId) {
      localStorage.setItem(ACTIVE_ACCOUNT_KEY, accountId);
    } else {
      localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    }
  }, []);

  // Auto-select first account if none selected
  useEffect(() => {
    if (accounts.length > 0 && !activeAccountId) {
      setActiveAccountId(accounts[0].id);
    }
  }, [accounts, activeAccountId, setActiveAccountId]);

  // Create account mutation
  const createAccount = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("trading_accounts")
        .insert({
          user_id: user.id,
          name,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["trading-accounts", user?.id] });
      setActiveAccountId(data.id);
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao criar conta",
        variant: "destructive",
      });
    },
  });

  // Update account mutation
  const updateAccount = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TradingAccount> & { id: string }) => {
      const { error } = await supabase
        .from("trading_accounts")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-accounts", user?.id] });
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar conta",
        variant: "destructive",
      });
    },
  });

  // Delete account mutation
  const deleteAccount = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("trading_accounts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trading-accounts", user?.id] });
      if (accounts.length > 1) {
        const remaining = accounts.filter(a => a.id !== activeAccountId);
        setActiveAccountId(remaining[0]?.id || null);
      } else {
        setActiveAccountId(null);
      }
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao excluir conta",
        variant: "destructive",
      });
    },
  });

  return {
    accounts,
    activeAccount,
    activeAccountId,
    setActiveAccountId,
    isLoading,
    createAccount: createAccount.mutate,
    updateAccount: updateAccount.mutate,
    deleteAccount: deleteAccount.mutate,
    isCreating: createAccount.isPending,
    isUpdating: updateAccount.isPending,
    isDeleting: deleteAccount.isPending,
  };
}
