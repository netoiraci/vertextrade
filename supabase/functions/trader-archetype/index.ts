import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tradeData } = await req.json();

    if (!tradeData) {
      return new Response(JSON.stringify({ error: "Trade data required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Generate archetype name and description
    const archetypePrompt = `Você é um analista de trading criativo. Com base nos dados de performance abaixo, crie um ARQUÉTIPO DE TRADER único e criativo em estilo Cyberpunk/Anime.

DADOS DE PERFORMANCE:
- Total de trades: ${tradeData.totalTrades}
- Win Rate: ${tradeData.winRate.toFixed(1)}%
- Profit Factor: ${tradeData.profitFactor.toFixed(2)}
- P&L Total: $${tradeData.totalPnL.toFixed(2)}
- Média de ganho: $${tradeData.avgWin.toFixed(2)}
- Média de perda: $${tradeData.avgLoss.toFixed(2)}
- Máximo de vitórias consecutivas: ${tradeData.maxConsecutiveWins}
- Máximo de derrotas consecutivas: ${tradeData.maxConsecutiveLosses}
- Tempo médio de operação: ${tradeData.avgHoldingTime.toFixed(0)} minutos

REGRAS:
1. Crie um NOME épico e único para o arquétipo (ex: "O Caçador de Pips", "Shogun do Scalping", "Samurai das Sombras", "Phantom Trader", "O Devorador de Tendências")
2. O nome deve refletir o estilo de trading baseado nos dados
3. Escreva uma descrição curta (2-3 frases) em primeira pessoa, como se o trader estivesse se apresentando
4. Seja criativo e use referências de anime/cyberpunk

Responda APENAS em JSON válido:
{
  "name": "Nome do Arquétipo",
  "description": "Descrição em primeira pessoa do trader"
}`;

    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: archetypePrompt }],
      }),
    });

    if (!textResponse.ok) {
      if (textResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (textResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const textData = await textResponse.json();
    const textContent = textData.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let archetypeInfo;
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        archetypeInfo = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      archetypeInfo = {
        name: "O Trader Misterioso",
        description: "Meus movimentos são calculados, minha estratégia é única. O mercado é meu campo de batalha."
      };
    }

    console.log("Generated archetype:", archetypeInfo);

    // Generate cyberpunk anime character image
    const imagePrompt = `A cyberpunk anime character portrait representing a trader called "${archetypeInfo.name}". 
Style: Cyberpunk anime, neon lights, futuristic, digital trader aesthetic.
Character: Confident pose, trading-related visual elements, holographic displays.
Colors: Neon green (#10b981), dark backgrounds, glowing effects.
Quality: High detail anime art style, transparent background, no text.
Aspect: Portrait bust shot, looking determined.`;

    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [{ role: "user", content: imagePrompt }],
        modalities: ["image", "text"],
      }),
    });

    let imageUrl: string | null = null;
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
      console.log("Image generated:", imageUrl ? "success" : "no image");
    } else {
      console.error("Image generation failed:", imageResponse.status);
    }

    // Save to database (upsert)
    const { error: dbError } = await supabase
      .from("trader_archetype")
      .upsert({
        user_id: user.id,
        archetype_name: archetypeInfo.name,
        archetype_description: archetypeInfo.description,
        archetype_image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save archetype");
    }

    return new Response(JSON.stringify({
      archetype_name: archetypeInfo.name,
      archetype_description: archetypeInfo.description,
      archetype_image_url: imageUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in trader-archetype:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
