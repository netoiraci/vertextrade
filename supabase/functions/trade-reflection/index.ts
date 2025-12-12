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
  commission: z.number().optional(),
  swap: z.number().optional(),
  duration: z.number(),
  isWin: z.boolean(),
});

const RequestSchema = z.object({
  trade: TradeSchema,
  message: z.string().optional(),
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

    const { trade, message } = validationResult.data;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const pips = Math.abs(trade.closePrice - trade.openPrice) * (trade.symbol.includes('JPY') ? 100 : 10000);
    const riskReward = trade.isWin ? (trade.netProfit / Math.abs(trade.netProfit)).toFixed(2) : 'N/A';

    const systemPrompt = `Você é um coach de trading especializado em reflexão pós-operação. Sua função é ajudar traders a desenvolver autoconhecimento através da análise profunda de suas operações.

DADOS DA OPERAÇÃO:
- Ticket: ${trade.ticket}
- Símbolo: ${trade.symbol}
- Tipo: ${trade.type}
- Tamanho: ${trade.size} lotes
- Preço de Entrada: ${trade.openPrice}
- Preço de Saída: ${trade.closePrice}
- Horário de Entrada: ${trade.openTime}
- Horário de Saída: ${trade.closeTime}
- Duração: ${trade.duration} minutos
- Resultado: ${trade.isWin ? '✅ GANHO' : '❌ PERDA'}
- Lucro/Prejuízo Líquido: $${trade.netProfit.toFixed(2)}
- Movimento em Pips: ~${pips.toFixed(1)}

INSTRUÇÕES:
1. Responda em português brasileiro
2. Faça perguntas reflexivas que ajudem o trader a entender sua decisão
3. Identifique pontos de aprendizado específicos desta operação
4. Se for uma perda, seja empático mas objetivo sobre o que poderia melhorar
5. Se for um ganho, explore o que funcionou para replicar
6. Use emojis para tornar a reflexão mais envolvente
7. Sugira aspectos emocionais e técnicos a considerar`;

    const userPrompt = message || `Analise esta operação de ${trade.symbol} e me ajude a refletir sobre ela. 
O que posso aprender com ${trade.isWin ? 'esse ganho' : 'essa perda'} de $${trade.netProfit.toFixed(2)}?`;

    console.log("Processing trade reflection for ticket:", trade.ticket);

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
    console.error("Trade reflection error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
