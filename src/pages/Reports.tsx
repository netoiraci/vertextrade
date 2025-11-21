import { Sidebar } from "@/components/Sidebar";

const Reports = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Reports</h1>
            <p className="text-muted-foreground">
              Advanced analytics and performance reports
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">Reports view coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
