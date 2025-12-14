import { LayoutDashboard, TrendingUp, BarChart3, FlaskConical, Calculator, Shield, Wallet, Newspaper, Calendar, ChevronLeft, GraduationCap, LogOut, UserCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { AccountSelector } from "@/components/AccountSelector";

const navItems = [
  { title: "Dashboard", icon: LayoutDashboard, url: "/" },
  { title: "Performance", icon: BarChart3, url: "/reports" },
  { title: "Trade Log", icon: TrendingUp, url: "/journal" },
  { title: "Calendar", icon: Calendar, url: "/calendar" },
  { title: "Mentor Mode", icon: GraduationCap, url: "/mentor" },
  { title: "Backtest", icon: FlaskConical, url: "/backtest" },
  { title: "Calculadora", icon: Calculator, url: "/calculator" },
  { title: "Gestão Mesa", icon: Shield, url: "/prop-firm" },
  { title: "Saques", icon: Wallet, url: "/withdrawals" },
  { title: "Notícias", icon: Newspaper, url: "/news" },
  { title: "Perfil", icon: UserCircle, url: "/profile" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user } = useAuth();

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-56'} h-screen bg-card border-r border-border flex flex-col sticky top-0 transition-all duration-300`}>
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold"><span className="text-primary">Vertex</span><span className="text-foreground">Trade</span></h1>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2">
          <AccountSelector />
          <AddTradeDialog />
        </div>
      )}
      
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
                activeClassName="bg-secondary/50 text-primary font-medium"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-border">
        {!collapsed && user && (
          <p className="px-3 py-1 text-xs text-muted-foreground truncate">{user.email}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className={`w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </aside>
  );
}
