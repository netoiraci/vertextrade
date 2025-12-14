import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History, ChevronDown, ChevronUp, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useArchetypeHistory, ArchetypeHistoryItem } from "@/hooks/useArchetypeHistory";
import { motion, AnimatePresence } from "framer-motion";

interface ArchetypeHistoryProps {
  accountId?: string | null;
}

export function ArchetypeHistory({ accountId }: ArchetypeHistoryProps) {
  const { history, isLoading } = useArchetypeHistory(accountId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading || history.length === 0) {
    return null;
  }

  return (
    <Card className="bg-card/50 border-border backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <History className="h-4 w-4" />
            Histórico de Arquétipos ({history.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {history.map((item) => (
                    <ArchetypeHistoryCard key={item.id} item={item} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function ArchetypeHistoryCard({ item }: { item: ArchetypeHistoryItem }) {
  const [showFull, setShowFull] = useState(false);

  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
      <div className="flex items-start gap-3">
        {item.archetype_image_url ? (
          <img
            src={item.archetype_image_url}
            alt={item.archetype_name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">
            {item.archetype_name}
          </h4>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      </div>
      <p className={`text-xs text-muted-foreground ${showFull ? "" : "line-clamp-2"}`}>
        {item.archetype_description}
      </p>
      {item.archetype_description.length > 100 && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-primary"
          onClick={() => setShowFull(!showFull)}
        >
          {showFull ? "Ver menos" : "Ver mais"}
        </Button>
      )}
    </div>
  );
}
