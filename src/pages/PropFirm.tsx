import { Sidebar } from "@/components/Sidebar";
import { Shield } from "lucide-react";

const PropFirm = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestão Mesa Proprietária</h1>
            <p className="text-muted-foreground">
              Acompanhe suas contas de mesa proprietária
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Em Breve</h2>
            <p className="text-muted-foreground">
              Gestão de contas FTMO, MyForexFunds e outras mesas proprietárias.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropFirm;
