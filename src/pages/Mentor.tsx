import { Sidebar } from "@/components/Sidebar";
import { useTrades } from "@/hooks/useTrades";
import { calculateMetrics } from "@/lib/parseTradeReport";
import { useState, useMemo, useCallback } from "react";
import { 
  GraduationCap, Brain, Sparkles, RefreshCw, AlertCircle, CalendarDays, 
  Send, Lightbulb, TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getHours, getDay, format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const MENTOR_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mentor-analysis`;
const ORACLE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oracle-chat`;
const REFLECTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trade-reflection`;

type PeriodFilter = "all" | "7d" | "30d" | "this_month" | "last_month" | "custom";

const PRESET_QUESTIONS = [
  "Qual é a minha configuração com maior probabilidade de sucesso?",
  "Quais padrões de negociação me levam às minhas maiores perdas?",
  "Quão consistente é minha gestão de riscos?",
  "Que padrões emocionais afetam minhas negociações?",
  "Qual é a minha taxa de vitórias em configurações A+ em comparação com outras classificações?",
  "Mostre-me as tendências no meu desempenho recente em negociações.",
];

const Mentor = () => {
  const { trades, isLoading } = useTrades();
  const { session } = useAuth();
  const { toast } = useToast();
  
  // Analysis state
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();

  // Oracle state
  const [oracleMessage, setOracleMessage] = useState("");
  const [oracleResponse, setOracleResponse] = useState("");
  const [isOracleLoading, setIsOracleLoading] = useState(false);

  // Reflection state
  const [selectedTradeId, setSelectedTradeId] = useState<string>("");
  const [reflectionResponse, setReflectionResponse] = useState("");
  const [isReflectionLoading, setIsReflectionLoading] = useState(false);

  // Filter trades by period
  const filteredTrades = useMemo(() => {
    if (trades.length === 0) return [];
    
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    switch (periodFilter) {
      case "7d":
        startDate = subDays(now, 7);
        endDate = now;
        break;
      case "30d":
        startDate = subDays(now, 30);
        endDate = now;
        break;
      case "this_month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "last_month":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "custom":
        if (customDateRange?.from) {
          startDate = customDateRange.from;
          endDate = customDateRange.to || customDateRange.from;
        }
        break;
      case "all":
      default:
        return trades;
    }

    if (!startDate || !endDate) return trades;

    return trades.filter(trade => 
      isWithinInterval(trade.closeTime, { start: startDate!, end: endDate! })
    );
  }, [trades, periodFilter, customDateRange]);

  const metrics = calculateMetrics(filteredTrades);

  const periodLabel = useMemo(() => {
    switch (periodFilter) {
      case "7d": return "Últimos 7 dias";
      case "30d": return "Últimos 30 dias";
      case "this_month": return "Este mês";
      case "last_month": return "Mês passado";
      case "custom": 
        if (customDateRange?.from && customDateRange?.to) {
          return `${format(customDateRange.from, "dd/MM/yy")} - ${format(customDateRange.to, "dd/MM/yy")}`;
        }
        return "Período personalizado";
      default: return "Todo o período";
    }
  }, [periodFilter, customDateRange]);

  const tradeData = useMemo(() => {
    if (filteredTrades.length === 0) return null;

    const sortedTrades = [...filteredTrades].sort((a, b) => a.closeTime.getTime() - b.closeTime.getTime());
    
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    sortedTrades.forEach((trade) => {
      if (trade.isWin) {
        currentWinStreak++;
        currentLossStreak = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
      } else {
        currentLossStreak++;
        currentWinStreak = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      }
    });

    const hourlyPnL: Record<number, number> = {};
    filteredTrades.forEach((trade) => {
      const hour = getHours(trade.openTime);
      hourlyPnL[hour] = (hourlyPnL[hour] || 0) + trade.netProfit;
    });
    
    const hourEntries = Object.entries(hourlyPnL);
    const bestHourEntry = hourEntries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const worstHourEntry = hourEntries.sort((a, b) => Number(a[1]) - Number(b[1]))[0];

    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dailyPnL: Record<number, number> = {};
    filteredTrades.forEach((trade) => {
      const day = getDay(trade.closeTime);
      dailyPnL[day] = (dailyPnL[day] || 0) + trade.netProfit;
    });
    
    const dayEntries = Object.entries(dailyPnL);
    const bestDayEntry = dayEntries.sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const worstDayEntry = dayEntries.sort((a, b) => Number(a[1]) - Number(b[1]))[0];

    const avgHoldingTime = filteredTrades.reduce((sum, t) => sum + t.duration, 0) / filteredTrades.length;
    const largestLoss = Math.min(...filteredTrades.map(t => t.netProfit));

    return {
      totalTrades: metrics.totalTrades,
      winRate: metrics.winRate,
      profitFactor: metrics.profitFactor === Infinity ? 999 : metrics.profitFactor,
      totalPnL: metrics.totalPnL,
      avgWin: metrics.avgWin,
      avgLoss: Math.abs(metrics.avgLoss),
      maxConsecutiveWins,
      maxConsecutiveLosses,
      bestHour: bestHourEntry ? `${bestHourEntry[0]}:00` : "N/A",
      worstHour: worstHourEntry ? `${worstHourEntry[0]}:00` : "N/A",
      bestDay: bestDayEntry ? days[Number(bestDayEntry[0])] : "N/A",
      worstDay: worstDayEntry ? days[Number(worstDayEntry[0])] : "N/A",
      avgHoldingTime,
      largestWin: metrics.largestWin,
      largestLoss: Math.abs(largestLoss),
      periodAnalyzed: periodLabel,
    };
  }, [filteredTrades, metrics, periodLabel]);

  const selectedTrade = useMemo(() => {
    return trades.find(t => t.ticket === selectedTradeId);
  }, [trades, selectedTradeId]);

  // Stream helper
  const streamResponse = async (
    url: string, 
    body: object, 
    onChunk: (text: string) => void,
    onError: (error: string) => void
  ) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Sessão expirada. Por favor, faça login novamente.");
      if (response.status === 429) throw new Error("Limite de requisições excedido. Tente novamente mais tarde.");
      if (response.status === 402) throw new Error("Créditos insuficientes. Adicione créditos ao seu workspace.");
      throw new Error("Falha ao obter resposta");
    }

    if (!response.body) throw new Error("Sem corpo de resposta");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") return;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onChunk(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  // Mentor Analysis
  const runAnalysis = useCallback(async () => {
    if (!tradeData || !session?.access_token) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis("");

    try {
      await streamResponse(
        MENTOR_URL,
        { tradeData },
        (chunk) => setAnalysis((prev) => prev + chunk),
        (err) => setError(err)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao analisar operações";
      setError(errorMessage);
      toast({ title: "Erro na análise", description: errorMessage, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  }, [tradeData, session, toast]);

  // Oracle Chat
  const sendOracleMessage = useCallback(async (message: string) => {
    if (!session?.access_token || !message.trim()) return;

    setOracleMessage("");
    setOracleResponse("");
    setIsOracleLoading(true);

    try {
      const tradesPayload = trades.slice(0, 100).map(t => ({
        ticket: t.ticket,
        symbol: t.symbol,
        type: t.type,
        size: t.size,
        openPrice: t.openPrice,
        closePrice: t.closePrice,
        openTime: format(t.openTime, "yyyy-MM-dd HH:mm"),
        closeTime: format(t.closeTime, "yyyy-MM-dd HH:mm"),
        netProfit: t.netProfit,
        duration: t.duration,
        isWin: t.isWin,
      }));

      await streamResponse(
        ORACLE_URL,
        { 
          message, 
          trades: tradesPayload,
          context: tradeData ? {
            totalTrades: tradeData.totalTrades,
            winRate: tradeData.winRate,
            profitFactor: tradeData.profitFactor,
            totalPnL: tradeData.totalPnL,
          } : undefined
        },
        (chunk) => setOracleResponse((prev) => prev + chunk),
        (err) => toast({ title: "Erro", description: err, variant: "destructive" })
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao consultar oráculo";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setIsOracleLoading(false);
    }
  }, [session, trades, tradeData, toast]);

  // Trade Reflection
  const runReflection = useCallback(async () => {
    if (!session?.access_token || !selectedTrade) return;

    setReflectionResponse("");
    setIsReflectionLoading(true);

    try {
      const tradePayload = {
        ticket: selectedTrade.ticket,
        symbol: selectedTrade.symbol,
        type: selectedTrade.type,
        size: selectedTrade.size,
        openPrice: selectedTrade.openPrice,
        closePrice: selectedTrade.closePrice,
        openTime: format(selectedTrade.openTime, "yyyy-MM-dd HH:mm"),
        closeTime: format(selectedTrade.closeTime, "yyyy-MM-dd HH:mm"),
        netProfit: selectedTrade.netProfit,
        commission: selectedTrade.commission,
        swap: selectedTrade.swap,
        duration: selectedTrade.duration,
        isWin: selectedTrade.isWin,
      };

      await streamResponse(
        REFLECTION_URL,
        { trade: tradePayload },
        (chunk) => setReflectionResponse((prev) => prev + chunk),
        (err) => toast({ title: "Erro", description: err, variant: "destructive" })
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao gerar reflexão";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setIsReflectionLoading(false);
    }
  }, [session, selectedTrade, toast]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Treinador de Comércio com IA</h1>
            <p className="text-muted-foreground">
              Obtenha insights personalizados, reflexões e orientação para melhorar seu desempenho no mercado financeiro.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center text-muted-foreground">Carregando...</div>
          ) : trades.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Importe suas operações no Dashboard para receber análises personalizadas.
              </p>
            </Card>
          ) : (
            <Tabs defaultValue="oracle" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="oracle" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Oráculo
                </TabsTrigger>
                <TabsTrigger value="reflection" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Reflexão
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Percepções
                </TabsTrigger>
              </TabsList>

              {/* Oracle Tab */}
              <TabsContent value="oracle" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Oráculo de Negociação</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Converse com seu oráculo de negociação de IA, que tem acesso completo ao seu diário de negociações.
                  </p>

                  {/* Center icon and prompt */}
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Consulte seu oráculo de negociação.
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                      Tenho acesso ao seu diário de negociação completo. Pergunte-me qualquer coisa sobre seu desempenho, padrões e configurações.
                    </p>
                  </div>

                  {/* Preset Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {PRESET_QUESTIONS.map((question, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendOracleMessage(question)}
                        disabled={isOracleLoading}
                        className="text-left p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 border border-border/50 text-sm text-foreground transition-colors disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-3">
                    <Textarea
                      value={oracleMessage}
                      onChange={(e) => setOracleMessage(e.target.value)}
                      placeholder="Pergunte sobre seu desempenho nas negociações..."
                      className="min-h-[50px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendOracleMessage(oracleMessage);
                        }
                      }}
                    />
                    <Button
                      onClick={() => sendOracleMessage(oracleMessage)}
                      disabled={isOracleLoading || !oracleMessage.trim()}
                      size="icon"
                      className="h-auto aspect-square"
                    >
                      {isOracleLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Oracle Response */}
                  {oracleResponse && (
                    <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                          {oracleResponse}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Reflection Tab */}
              <TabsContent value="reflection" className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-foreground">Reflexão pós-negociação</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">
                    Responda a perguntas personalizadas sobre suas negociações recentes para desenvolver o autoconhecimento.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <Select value={selectedTradeId} onValueChange={setSelectedTradeId}>
                      <SelectTrigger className="w-full sm:w-[350px]">
                        <SelectValue placeholder="Selecione uma operação para refletir." />
                      </SelectTrigger>
                      <SelectContent>
                        {trades.slice(0, 50).map((trade) => (
                          <SelectItem key={trade.ticket} value={trade.ticket}>
                            {trade.symbol} | {trade.type} | {trade.isWin ? '✅' : '❌'} ${trade.netProfit.toFixed(2)} | {format(trade.closeTime, "dd/MM HH:mm")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={runReflection}
                      disabled={isReflectionLoading || !selectedTradeId}
                    >
                      {isReflectionLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Gerar Reflexão
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Selected Trade Details */}
                  {selectedTrade && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Símbolo</p>
                        <p className="font-semibold text-foreground">{selectedTrade.symbol}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tipo</p>
                        <p className="font-semibold text-foreground">{selectedTrade.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duração</p>
                        <p className="font-semibold text-foreground">{selectedTrade.duration} min</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Resultado</p>
                        <p className={`font-semibold ${selectedTrade.isWin ? 'text-success' : 'text-danger'}`}>
                          ${selectedTrade.netProfit.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reflection Response */}
                  {reflectionResponse && (
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                      <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                          {reflectionResponse}
                        </div>
                      </div>
                    </div>
                  )}

                  {!selectedTradeId && !reflectionResponse && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>Selecione uma operação acima para iniciar sua reflexão.</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Insights Tab (Original Analysis) */}
              <TabsContent value="insights" className="space-y-6">
                {/* Period Filter */}
                <Card className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Período de Análise:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todo o período</SelectItem>
                          <SelectItem value="7d">Últimos 7 dias</SelectItem>
                          <SelectItem value="30d">Últimos 30 dias</SelectItem>
                          <SelectItem value="this_month">Este mês</SelectItem>
                          <SelectItem value="last_month">Mês passado</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>

                      {periodFilter === "custom" && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="min-w-[200px] justify-start">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {customDateRange?.from ? (
                                customDateRange.to ? (
                                  `${format(customDateRange.from, "dd/MM/yy")} - ${format(customDateRange.to, "dd/MM/yy")}`
                                ) : (
                                  format(customDateRange.from, "dd/MM/yy")
                                )
                              ) : (
                                "Selecione as datas"
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={customDateRange?.from}
                              selected={customDateRange}
                              onSelect={setCustomDateRange}
                              numberOfMonths={2}
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                  {filteredTrades.length !== trades.length && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Mostrando {filteredTrades.length} de {trades.length} operações ({periodLabel})
                    </p>
                  )}
                </Card>

                {/* Stats Summary */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Resumo de Performance</h2>
                    </div>
                    <Button
                      onClick={runAnalysis}
                      disabled={isAnalyzing || !session || filteredTrades.length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Gerar Análise AI
                        </>
                      )}
                    </Button>
                  </div>

                  {filteredTrades.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma operação encontrada no período selecionado.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Total Trades</p>
                        <p className="text-xl font-bold text-foreground">{tradeData?.totalTrades}</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                        <p className="text-xl font-bold text-foreground">{tradeData?.winRate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Profit Factor</p>
                        <p className="text-xl font-bold text-foreground">
                          {tradeData?.profitFactor === 999 ? "∞" : tradeData?.profitFactor.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground">Net P&L</p>
                        <p className={`text-xl font-bold ${(tradeData?.totalPnL || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                          ${tradeData?.totalPnL.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Error State */}
                {error && (
                  <Card className="p-6 border-danger/50 bg-danger/5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-danger mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-danger">Erro na Análise</h3>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* AI Analysis */}
                {analysis && (
                  <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">Análise do Mentor AI</h2>
                      <span className="text-xs text-muted-foreground ml-auto">({periodLabel})</span>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-foreground/90 leading-relaxed">
                        {analysis}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Initial State */}
                {!analysis && !isAnalyzing && !error && filteredTrades.length > 0 && (
                  <Card className="p-8 text-center border-dashed">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Pronto para Análise
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Clique em "Gerar Análise AI" para receber insights personalizados do seu mentor de trading baseado no período selecionado.
                    </p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Mentor;
