import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface ArchetypeHistoryItem {
  id: string;
  user_id: string;
  account_id: string | null;
  archetype_name: string;
  archetype_description: string;
  archetype_image_url: string | null;
  created_at: string;
}

export function useArchetypeHistory(accountId?: string | null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["archetype-history", user?.id, accountId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("archetype_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ArchetypeHistoryItem[];
    },
    enabled: !!user,
  });

  // Save to history mutation
  const saveToHistory = useMutation({
    mutationFn: async (archetype: {
      archetype_name: string;
      archetype_description: string;
      archetype_image_url?: string | null;
      account_id?: string | null;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("archetype_history")
        .insert({
          user_id: user.id,
          account_id: archetype.account_id || null,
          archetype_name: archetype.archetype_name,
          archetype_description: archetype.archetype_description,
          archetype_image_url: archetype.archetype_image_url || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archetype-history", user?.id] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar histórico do arquétipo",
        variant: "destructive",
      });
    },
  });

  return {
    history,
    isLoading,
    saveToHistory: saveToHistory.mutate,
    isSaving: saveToHistory.isPending,
  };
}
