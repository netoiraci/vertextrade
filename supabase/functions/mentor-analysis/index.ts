import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const TradeDataSchema = z.object({
  totalTrades: z.number().min(0),
  winRate: z.number().min(0).max(100),
  profitFactor: z.number().min(0),
  totalPnL: z.number(),
  avgWin: z.number().min(0),
  avgLoss: z.number().min(0),
  maxConsecutiveWins: z.number().min(0),
  maxConsecutiveLosses: z.number().min(0),
  bestHour: z.string(),
  worstHour: z.string(),
  bestDay: z.string(),
  worstDay: z.string(),
  avgHoldingTime: z.number().min(0),
  largestWin: z.number().min(0),
  largestLoss: z.number().min(0),
  periodAnalyzed: z.string().optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input data
    const validationResult = TradeDataSchema.safeParse(body.tradeData);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data", 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tradeData = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Você é um mentor de trading experiente e empático. Analise os dados de trading fornecidos e forneça insights acionáveis e conselhos personalizados.

Suas respostas devem:
1. Ser em português brasileiro
2. Identificar pontos fortes e fracos do trader
3. Sugerir melhorias específicas baseadas nos dados
4. Usar linguagem motivadora mas realista
5. Focar em disciplina, gerenciamento de risco e psicologia do trading
6. Identificar padrões problemáticos (horários ruins, dias ruins, tempo de permanência)
7. Dar no máximo 5 insights principais
8. Usar emojis para tornar a leitura mais agradável

Formato da resposta:
- Use títulos claros com emojis
- Seja direto e objetivo
- Inclua números e porcentagens dos dados
- Termine com uma mensagem motivacional`;

    const periodInfo = tradeData.periodAnalyzed 
      ? `\n📅 **Período Analisado:** ${tradeData.periodAnalyzed}` 
      : "";

    const userPrompt = `Analise estes dados de trading e forneça insights personalizados:
${periodInfo}

📊 **Estatísticas Gerais:**
- Total de Operações: ${tradeData.totalTrades}
- Win Rate: ${tradeData.winRate.toFixed(1)}%
- Profit Factor: ${tradeData.profitFactor.toFixed(2)}
- P&L Total: $${tradeData.totalPnL.toFixed(2)}

💰 **Métricas de Lucro/Perda:**
- Ganho Médio: $${tradeData.avgWin.toFixed(2)}
- Perda Média: $${tradeData.avgLoss.toFixed(2)}
- Maior Ganho: $${tradeData.largestWin.toFixed(2)}
- Maior Perda: $${tradeData.largestLoss.toFixed(2)}

🔥 **Sequências:**
- Máximo de Vitórias Consecutivas: ${tradeData.maxConsecutiveWins}
- Máximo de Perdas Consecutivas: ${tradeData.maxConsecutiveLosses}

⏰ **Padrões Temporais:**
- Melhor Horário: ${tradeData.bestHour}
- Pior Horário: ${tradeData.worstHour}
- Melhor Dia: ${tradeData.bestDay}
- Pior Dia: ${tradeData.worstDay}
- Tempo Médio de Permanência: ${tradeData.avgHoldingTime.toFixed(0)} minutos

${tradeData.periodAnalyzed ? `Considere que esta análise é específica para o período "${tradeData.periodAnalyzed}". Mencione isso na sua análise e dê insights relevantes para este período específico.` : ""}

Forneça uma análise detalhada com insights acionáveis.`;

    console.log("Processing mentor analysis for user");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Mentor analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
