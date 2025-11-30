import { Sidebar } from "@/components/Sidebar";
import { FlaskConical } from "lucide-react";

const Backtest = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Backtest</h1>
            <p className="text-muted-foreground">
              Teste suas estratégias com dados históricos
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <FlaskConical className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Em Breve</h2>
            <p className="text-muted-foreground">
              Ferramenta de backtest para testar suas estratégias de trading.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Backtest;
