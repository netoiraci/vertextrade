import { LayoutDashboard, TrendingUp, BarChart3, FlaskConical, Calculator, Shield, Wallet, Newspaper } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Operações", icon: TrendingUp, url: "/journal" },
  { title: "Performance", icon: BarChart3, url: "/reports" },
  { title: "Backtest", icon: FlaskConical, url: "/backtest" },
  { title: "Calculadora", icon: Calculator, url: "/calculator" },
  { title: "Gestão Mesa Proprietária", icon: Shield, url: "/prop-firm" },
  { title: "Saques", icon: Wallet, url: "/withdrawals" },
  { title: "Notícias", icon: Newspaper, url: "/news" },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Chivunk</h1>
        <p className="text-xs text-muted-foreground mt-1">Trading Journal</p>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
                activeClassName="bg-secondary/50 text-primary font-medium border border-primary/20"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Performance Hoje</p>
          <p className="text-success mt-1">+$420.50</p>
        </div>
      </div>
    </aside>
  );
}
