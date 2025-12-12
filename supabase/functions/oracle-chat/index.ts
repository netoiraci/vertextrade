import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TradeSchema = z.object({
  ticket: z.string(),
  symbol: z.string(),
  type: z.string(),
  size: z.number(),
  openPrice: z.number(),
  closePrice: z.number(),
  openTime: z.string(),
  closeTime: z.string(),
  netProfit: z.number(),
  duration: z.number(),
  isWin: z.boolean(),
});

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  trades: z.array(TradeSchema),
  context: z.object({
    totalTrades: z.number(),
    winRate: z.number(),
    profitFactor: z.number(),
    totalPnL: z.number(),
  }).optional(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { message, trades, context } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build trades context
    const tradesContext = trades.length > 0 
      ? trades.slice(0, 100).map(t => 
          `${t.symbol} ${t.type} | ${t.isWin ? 'WIN' : 'LOSS'} | $${t.netProfit.toFixed(2)} | ${t.duration}min | ${t.openTime}`
        ).join('\n')
      : "Nenhuma operação registrada.";

    const systemPrompt = `Você é o Oráculo de Negociação, um mentor de trading experiente com acesso completo ao diário de negociações do usuário.

CONTEXTO DAS OPERAÇÕES:
- Total de Operações: ${context?.totalTrades || trades.length}
- Win Rate: ${context?.winRate?.toFixed(1) || 'N/A'}%
- Profit Factor: ${context?.profitFactor?.toFixed(2) || 'N/A'}
- P&L Total: $${context?.totalPnL?.toFixed(2) || 'N/A'}

ÚLTIMAS OPERAÇÕES:
${tradesContext}

INSTRUÇÕES:
1. Responda sempre em português brasileiro
2. Seja direto, objetivo e use emojis para engajamento
3. Baseie suas respostas nos dados reais do trader
4. Identifique padrões, forças e fraquezas
5. Ofereça insights acionáveis e específicos
6. Mantenha um tom motivador mas realista
7. Quando apropriado, cite operações específicas como exemplo`;

    console.log("Processing oracle chat");

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
          { role: "user", content: message },
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
    console.error("Oracle chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
