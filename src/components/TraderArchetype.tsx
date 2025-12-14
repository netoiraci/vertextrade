import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useArchetypeHistory } from "@/hooks/useArchetypeHistory";
import { ArchetypeHistory } from "@/components/ArchetypeHistory";

interface TradeData {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  totalPnL: number;
  avgWin: number;
  avgLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgHoldingTime: number;
}

interface ArchetypeData {
  archetype_name: string;
  archetype_description: string;
  archetype_image_url: string | null;
}

interface TraderArchetypeProps {
  tradeData: TradeData | null;
  accountId?: string | null;
}

const ARCHETYPE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trader-archetype`;

export function TraderArchetype({ tradeData, accountId }: TraderArchetypeProps) {
  const { session, user } = useAuth();
  const { toast } = useToast();
  const { saveToHistory } = useArchetypeHistory(accountId);
  
  const [archetype, setArchetype] = useState<ArchetypeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing archetype
  useEffect(() => {
    const fetchArchetype = async () => {
      if (!user) return;
      
      try {
        let query = supabase
          .from("trader_archetype")
          .select("*")
          .eq("user_id", user.id);
        
        if (accountId) {
          query = query.eq("account_id", accountId);
        } else {
          query = query.is("account_id", null);
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        if (data) {
          setArchetype({
            archetype_name: data.archetype_name,
            archetype_description: data.archetype_description,
            archetype_image_url: data.archetype_image_url,
          });
        } else {
          setArchetype(null);
        }
      } catch (error) {
        console.error("Error fetching archetype:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchetype();
  }, [user, accountId]);

  const generateArchetype = async () => {
    if (!session?.access_token || !tradeData) return;

    // Save current archetype to history before generating new one
    if (archetype) {
      saveToHistory({
        archetype_name: archetype.archetype_name,
        archetype_description: archetype.archetype_description,
        archetype_image_url: archetype.archetype_image_url,
        account_id: accountId,
      });
    }

    setIsGenerating(true);
    try {
      const response = await fetch(ARCHETYPE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tradeData, accountId }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
        if (response.status === 402) throw new Error("Créditos insuficientes.");
        throw new Error("Falha ao gerar arquétipo");
      }

      const data = await response.json();
      setArchetype(data);
      
      toast({
        title: "Arquétipo gerado!",
        description: `Você é: ${data.archetype_name}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar arquétipo";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Seu Arquétipo de Trader</h2>
          </div>
          <Button
            onClick={generateArchetype}
            disabled={isGenerating || !tradeData}
            variant={archetype ? "outline" : "default"}
            size="sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : archetype ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Descobrir Arquétipo
              </>
            )}
          </Button>
        </div>

        {archetype ? (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Character Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              {archetype.archetype_image_url ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-lg blur-xl" />
                  <img
                    src={archetype.archetype_image_url}
                    alt={archetype.archetype_name}
                    className="relative w-40 h-40 md:w-48 md:h-48 object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Archetype Info */}
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-3">
                {archetype.archetype_name}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {archetype.archetype_description}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Descubra seu arquétipo de trader
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              A IA analisará seus resultados e definirá um personagem único que representa seu estilo de trading.
            </p>
            {!tradeData && (
              <p className="text-sm text-muted-foreground">
                Importe trades para gerar seu arquétipo.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Archetype History */}
      <ArchetypeHistory accountId={accountId} />
    </div>
  );
}
