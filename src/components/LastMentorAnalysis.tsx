import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Brain, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MarkdownText } from "@/components/MarkdownText";
import { useMentorAnalyses, MentorAnalysis } from "@/hooks/useMentorAnalyses";

interface LastMentorAnalysisProps {
  accountId?: string | null;
  currentAnalysis?: string;
}

export function LastMentorAnalysis({ accountId, currentAnalysis }: LastMentorAnalysisProps) {
  const { latestAnalysis, isLoading } = useMentorAnalyses(accountId, "percepcoes");

  // If there's a current analysis being shown, don't show the last saved one
  if (currentAnalysis) return null;

  if (isLoading || !latestAnalysis) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Última Análise do Mentor AI</h2>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {format(new Date(latestAnalysis.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </div>
      </div>
      {latestAnalysis.period_filter && (
        <p className="text-xs text-muted-foreground mb-3">
          Período analisado: {latestAnalysis.period_filter}
        </p>
      )}
      <div className="prose prose-invert prose-sm max-w-none">
        <MarkdownText content={latestAnalysis.analysis_content} className="text-foreground/90" />
      </div>
    </Card>
  );
}
