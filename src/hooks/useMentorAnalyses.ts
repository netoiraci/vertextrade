import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface MentorAnalysis {
  id: string;
  user_id: string;
  account_id: string | null;
  analysis_type: string;
  analysis_content: string;
  period_filter: string | null;
  created_at: string;
}

export function useMentorAnalyses(accountId?: string | null, analysisType: string = "percepcoes") {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: analyses = [], isLoading } = useQuery({
    queryKey: ["mentor-analyses", user?.id, accountId, analysisType],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("mentor_analyses")
        .select("*")
        .eq("user_id", user.id)
        .eq("analysis_type", analysisType)
        .order("created_at", { ascending: false })
        .limit(1);

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MentorAnalysis[];
    },
    enabled: !!user,
  });

  // Get the latest analysis
  const latestAnalysis = analyses[0] || null;

  // Save analysis mutation
  const saveAnalysis = useMutation({
    mutationFn: async (analysis: {
      analysis_content: string;
      analysis_type?: string;
      period_filter?: string | null;
      account_id?: string | null;
    }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("mentor_analyses")
        .insert({
          user_id: user.id,
          account_id: analysis.account_id || null,
          analysis_type: analysis.analysis_type || "percepcoes",
          analysis_content: analysis.analysis_content,
          period_filter: analysis.period_filter || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-analyses", user?.id] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao salvar análise",
        variant: "destructive",
      });
    },
  });

  return {
    analyses,
    latestAnalysis,
    isLoading,
    saveAnalysis: saveAnalysis.mutate,
    isSaving: saveAnalysis.isPending,
  };
}
