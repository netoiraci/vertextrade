import { Sidebar } from "@/components/Sidebar";

const Journal = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Trading Journal</h1>
            <p className="text-muted-foreground">
              Detailed trade-by-trade analysis and notes
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Journal view coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;
